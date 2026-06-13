import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { errors, ok } from "@/lib/api";
import { makeChangelogConfirmToken } from "@/lib/jwt";

const subscribeSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ org: string }> }) {
  const { org: orgSlug } = await params;

  if (!process.env.EMAIL_FROM_DOMAIN) {
    return errors.unprocessable("Email subscriptions are not configured for this instance.");
  }

  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) return errors.notFound("Organization not found.");

  const body = await req.json().catch(() => null);
  if (!body) return errors.badRequest("Invalid JSON body.");

  const parsed = subscribeSchema.safeParse(body);
  if (!parsed.success) return errors.badRequest("Valid email required.");

  const { email } = parsed.data;

  const existing = await prisma.changelogSubscriber.findUnique({
    where: { orgId_email: { orgId: org.id, email } },
  });

  if (existing?.confirmed) {
    return ok({ message: "Already subscribed." });
  }

  await prisma.changelogSubscriber.upsert({
    where: { orgId_email: { orgId: org.id, email } },
    create: { orgId: org.id, email, confirmed: false },
    update: {},
  });

  const token = makeChangelogConfirmToken(email, org.secretKey);
  const confirmUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${orgSlug}/changelog/confirm?email=${encodeURIComponent(email)}&token=${token}`;

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: `${org.name} <noreply@${process.env.EMAIL_FROM_DOMAIN}>`,
      to: email,
      subject: `Confirm your subscription to ${org.name} updates`,
      html: `<p>Hi,</p><p>Click the link below to confirm your subscription to <strong>${org.name}</strong> changelog updates.</p><p><a href="${confirmUrl}">Confirm subscription →</a></p><p style="color:#666;font-size:12px;">If you didn't request this, ignore this email.</p>`,
    });
  } catch (e) {
    console.error("Failed to send confirmation email:", e);
    return errors.internal();
  }

  return ok({ message: "Confirmation email sent. Check your inbox." });
}
