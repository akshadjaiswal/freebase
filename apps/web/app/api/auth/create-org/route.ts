import { NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { errors, ok } from "@/lib/api";
import { logger } from "@/lib/logger";

const schema = z.object({
  orgName: z.string().min(1).max(100),
  slug: z
    .string()
    .min(3)
    .max(48)
    .regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers, and hyphens."),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export async function POST(request: NextRequest) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errors.badRequest("Request body must be valid JSON.");
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors = parsed.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    return errors.badRequest("Request body failed validation.", fieldErrors);
  }

  const { orgName, slug, email, password } = parsed.data;

  // Check slug availability
  const existingOrg = await prisma.organization.findUnique({ where: { slug } });
  if (existingOrg) {
    return errors.conflict(`The slug "${slug}" is already taken. Please choose another.`);
  }

  // Create Supabase Auth user (store orgSlug in metadata for middleware redirect)
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // auto-confirm in v1 (no email verification step)
    user_metadata: { orgSlug: slug },
  });

  if (authError || !authData.user) {
    if (authError?.message.includes("already registered")) {
      return errors.conflict("An account with this email already exists.");
    }
    logger.error("Supabase auth error during org creation", { error: authError?.message });
    return errors.internal();
  }

  // Create org + user in Neon DB atomically
  try {
    const org = await prisma.organization.create({
      data: {
        slug,
        name: orgName,
        secretKey: randomBytes(32).toString("hex"), // HMAC key for widget JWT
        users: {
          create: {
            id: authData.user.id, // must match Supabase Auth UID exactly
            email,
            role: "admin",
          },
        },
      },
    });

    return ok({ orgSlug: org.slug }, 201);
  } catch (err) {
    // Roll back Supabase user if DB write failed
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id).catch(() => {});
    logger.error("DB error during org creation", { error: err instanceof Error ? err.message : String(err) });
    return errors.internal();
  }
}
