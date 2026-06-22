export interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  lastUsedAt: string | null;
  createdAt: string;
}

export interface WebhookItem {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  createdAt: string;
}

export interface OrgSettings {
  id: string;
  name: string;
  slug: string;
  accentColor: string;
  secretKey: string;
}

export type ConfirmAction =
  | { type: "regen-secret" }
  | { type: "delete-key"; id: string }
  | { type: "delete-webhook"; id: string };

export const ALL_EVENTS = [
  "post.created",
  "post.updated",
  "post.status_changed",
  "post.deleted",
  "comment.created",
  "changelog.published",
] as const;
