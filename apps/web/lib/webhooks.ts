import { prisma } from "@/lib/prisma";
import { signWebhookPayload } from "@/lib/jwt";

export type WebhookEvent =
  | "post.created"
  | "post.updated"
  | "post.status_changed"
  | "post.deleted"
  | "comment.created"
  | "changelog.published";

export interface WebhookPayload {
  event: WebhookEvent;
  org: string;
  data: Record<string, unknown>;
}

// Retry delays in milliseconds: immediate, 30s, 5min, 30min, 2hr
const RETRY_DELAYS = [0, 30_000, 300_000, 1_800_000, 7_200_000];

async function deliverOnce(
  url: string,
  payload: string,
  signature: string,
  timestamp: string,
  event: WebhookEvent
): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Freebase-Signature": signature,
        "X-Freebase-Timestamp": timestamp,
        "X-Freebase-Event": event,
      },
      body: payload,
      signal: controller.signal,
    });

    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}

async function deliverWithRetry(
  url: string,
  secretHash: string,
  payload: WebhookPayload
): Promise<void> {
  const body = JSON.stringify({
    event: payload.event,
    timestamp: new Date().toISOString(),
    org: payload.org,
    data: payload.data,
  });

  const { signature, timestamp } = signWebhookPayload(body, secretHash);

  for (let attempt = 0; attempt < RETRY_DELAYS.length; attempt++) {
    const delay = RETRY_DELAYS[attempt];
    if (delay > 0) await new Promise((r) => setTimeout(r, delay));

    const success = await deliverOnce(url, body, signature, timestamp, payload.event);
    if (success) return;
  }
}

// Fire-and-forget webhook dispatch for an event — finds all matching active webhooks and delivers
export function dispatchWebhook(orgId: string, payload: WebhookPayload): void {
  // Intentionally not awaited — runs in background
  void (async () => {
    const webhooks = await prisma.webhook.findMany({
      where: {
        orgId,
        active: true,
        events: { has: payload.event },
      },
    });

    await Promise.allSettled(
      webhooks.map((wh) => deliverWithRetry(wh.url, wh.secret, payload))
    );
  })();
}
