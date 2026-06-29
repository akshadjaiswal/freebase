import { NextResponse } from "next/server";

// RFC 9457 Problem Details error factory
export function problemResponse(
  status: number,
  slug: string,
  title: string,
  detail: string,
  extra?: Record<string, unknown>,
  extraHeaders: Record<string, string> = {}
) {
  return NextResponse.json(
    {
      type: `${process.env.NEXT_PUBLIC_APP_URL}/errors/${slug}`,
      title,
      status,
      detail,
      ...extra,
    },
    {
      status,
      headers: {
        "Content-Type": "application/problem+json",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        ...extraHeaders,
      },
    }
  );
}

export const errors = {
  badRequest: (detail: string, errors?: Array<{ field: string; message: string }>) =>
    problemResponse(400, "bad-request", "Validation Error", detail, errors ? { errors } : undefined),

  unauthorized: (detail = "Missing or invalid API key.") =>
    problemResponse(401, "unauthorized", "Unauthorized", detail),

  forbidden: (detail = "You do not have access to this resource.") =>
    problemResponse(403, "forbidden", "Forbidden", detail),

  notFound: (detail = "The requested resource does not exist.") =>
    problemResponse(404, "not-found", "Not Found", detail),

  conflict: (detail: string) =>
    problemResponse(409, "conflict", "Conflict", detail),

  unprocessable: (detail: string) =>
    problemResponse(422, "unprocessable", "Unprocessable Entity", detail),

  rateLimited: (retryAfter: number) =>
    problemResponse(429, "rate-limited", "Too Many Requests", `Rate limit exceeded. Try again in ${retryAfter} seconds.`, { retryAfter }),

  internal: () =>
    problemResponse(500, "internal", "Internal Server Error", "An unexpected error occurred."),
};

// Cursor pagination — encode/decode opaque cursors
export function encodeCursor(id: string, createdAt: Date): string {
  return Buffer.from(JSON.stringify({ id, createdAt: createdAt.toISOString() })).toString("base64url");
}

export function decodeCursor(cursor: string): { id: string; createdAt: string } | null {
  try {
    return JSON.parse(Buffer.from(cursor, "base64url").toString("utf-8"));
  } catch {
    return null;
  }
}

// Standard success response
export function ok(data: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return NextResponse.json(data, {
    status,
    headers: {
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      ...extraHeaders,
    },
  });
}
