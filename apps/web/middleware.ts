import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { getPublicReadLimiter, getApiKeyLimiter, getClientIp, rateLimitHeaders } from "@/lib/rate-limit";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ─── API rate limiting ────────────────────────────────────────────────────
  if (pathname.startsWith("/api/v1/")) {
    const ip = getClientIp(request);
    const isAuthenticated = request.headers.get("authorization")?.startsWith("Bearer fb_");

    const limiter = isAuthenticated ? getApiKeyLimiter() : getPublicReadLimiter();

    if (limiter) {
      const key = isAuthenticated
        ? request.headers.get("authorization")!.slice(7, 20) // key prefix as identifier
        : ip;

      const { success, limit, remaining, reset } = await limiter.limit(key);

      if (!success) {
        const retryAfter = Math.ceil((reset - Date.now()) / 1000);
        return NextResponse.json(
          {
            type: `${process.env.NEXT_PUBLIC_APP_URL}/errors/rate-limited`,
            title: "Too Many Requests",
            status: 429,
            detail: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
            retryAfter,
          },
          {
            status: 429,
            headers: {
              "Content-Type": "application/problem+json",
              "Retry-After": String(retryAfter),
              ...rateLimitHeaders(limit, remaining, reset),
            },
          }
        );
      }
    }
  }

  // ─── Admin route protection ───────────────────────────────────────────────
  if (pathname.includes("/admin")) {
    const { supabaseResponse, user } = await updateSession(request);

    if (!user) {
      // Extract org slug from path for redirect
      const orgMatch = pathname.match(/^\/([^/]+)\/admin/);
      const orgSlug = orgMatch?.[1];
      const loginUrl = new URL("/login", request.url);
      if (orgSlug) loginUrl.searchParams.set("org", orgSlug);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return supabaseResponse;
  }

  // ─── Redirect logged-in users away from marketing + create-org pages ────────
  if (pathname === "/" || pathname.startsWith("/new")) {
    const { supabaseResponse, user } = await updateSession(request);
    const orgSlug = user?.user_metadata?.orgSlug as string | undefined;
    if (orgSlug) {
      return NextResponse.redirect(new URL(`/${orgSlug}/admin/feedback`, request.url));
    }
    return supabaseResponse;
  }

  // ─── Auth route session refresh + logged-in redirect ────────────────────
  if (pathname.startsWith("/login")) {
    const { supabaseResponse, user } = await updateSession(request);
    const orgSlug = user?.user_metadata?.orgSlug as string | undefined;
    if (orgSlug) {
      return NextResponse.redirect(new URL(`/${orgSlug}/admin/feedback`, request.url));
    }
    return supabaseResponse;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next/static|_next/image|favicon.ico|cdn|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
