// Shared CORS + origin-allowlist helpers for widget-facing API routes.
// Echoes back the request's Origin (not "*") once present, so per-request
// allow/deny can coexist with the response's own CORS headers.

export function corsHeaders(request: Request, methods: string): Record<string, string> {
  const origin = request.headers.get("origin");
  return {
    "Access-Control-Allow-Origin": origin ?? "*",
    "Access-Control-Allow-Methods": methods,
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Freebase-User",
    "Vary": "Origin",
  };
}

// No Origin header (server-to-server, curl) -> not enforced.
// Origin matches the app's own origin (same-origin browser call from our own
// public pages, e.g. the feedback board's submit/vote/comment fetches) -> always
// allowed, regardless of the allowlist — this is never a third-party embed.
// Empty allowedOrigins (org hasn't opted in) -> unrestricted, matches pre-existing behavior.
// Otherwise -> Origin must exactly match one of allowedOrigins (case-insensitive, ignoring trailing slash).
export function checkOriginAllowed(
  request: Request,
  allowedOrigins: string[] | undefined | null
): { allowed: true } | { allowed: false; origin: string } {
  const origin = request.headers.get("origin");
  if (!origin) return { allowed: true };

  const normalize = (o: string) => o.trim().toLowerCase().replace(/\/$/, "");
  const normalizedOrigin = normalize(origin);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl && normalize(appUrl) === normalizedOrigin) return { allowed: true };

  if (!allowedOrigins || allowedOrigins.length === 0) return { allowed: true };
  if (allowedOrigins.some((o) => normalize(o) === normalizedOrigin)) return { allowed: true };
  return { allowed: false, origin };
}
