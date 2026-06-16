import { createHmac, timingSafeEqual } from "crypto";
import * as jose from "jose";

// Widget JWT — signed by the host app using the org's secretKey (HMAC-SHA256)
// Payload: { userId, email, name, orgSlug, iat, exp }
// orgSlug must equal the org's URL slug (not DB cuid)

export interface WidgetJwtPayload {
  userId: string;
  email: string;
  name?: string;
  orgSlug: string;
  iat: number;
  exp: number;
}

export async function verifyWidgetJwt(
  token: string,
  secretKey: string
): Promise<WidgetJwtPayload | null> {
  try {
    const secret = new TextEncoder().encode(secretKey);
    const { payload } = await jose.jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });

    if (
      typeof payload.userId !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.orgSlug !== "string"
    ) {
      return null;
    }

    return payload as unknown as WidgetJwtPayload;
  } catch {
    return null;
  }
}

// Webhook HMAC signature verification
export function verifyWebhookSignature(
  rawBody: string,
  timestamp: string,
  signature: string,
  secret: string
): boolean {
  const now = Math.floor(Date.now() / 1000);
  const ts = parseInt(timestamp, 10);

  // Reject if timestamp is more than 5 minutes old (replay attack protection)
  if (Math.abs(now - ts) > 300) return false;

  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`)
    .digest("hex");

  const expectedHeader = `sha256=${expected}`;

  try {
    // Constant-time compare to prevent timing attacks
    return timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedHeader)
    );
  } catch {
    return false;
  }
}

// Changelog subscription confirmation token — timestamped HMAC, expires 48h
export function makeChangelogConfirmToken(email: string, orgSecret: string): string {
  const ts = Math.floor(Date.now() / 1000).toString();
  const sig = createHmac("sha256", orgSecret).update(`${email}:${ts}`).digest("hex");
  return `${ts}.${sig}`;
}

export function verifyChangelogConfirmToken(
  token: string,
  email: string,
  orgSecret: string
): boolean {
  const dot = token.indexOf(".");
  if (dot === -1) return false;
  const ts = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!ts || !sig) return false;
  const age = Math.floor(Date.now() / 1000) - parseInt(ts, 10);
  if (age > 48 * 3600 || age < 0) return false;
  const expected = createHmac("sha256", orgSecret).update(`${email}:${ts}`).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch { return false; }
}

// Compute HMAC signature for outgoing webhooks
export function signWebhookPayload(
  rawBody: string,
  secret: string
): { signature: string; timestamp: string } {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const sig = createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`)
    .digest("hex");
  return { signature: `sha256=${sig}`, timestamp };
}
