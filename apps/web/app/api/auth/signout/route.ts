import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const org = request.nextUrl.searchParams.get("org");
  const redirectUrl = org ? `/login?org=${org}` : "/login";

  return NextResponse.redirect(new URL(redirectUrl, request.url));
}
