export type StatusValue = "open" | "planned" | "in-progress" | "done" | "closed";

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Comment {
  id: string;
  body: string;
  author: { email: string; name?: string | null };
  createdAt: string;
}

export interface Post {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  votes: number;
  commentCount: number;
  category?: Category | null;
  pinned: boolean;
  author: { email: string; name?: string | null };
  createdAt: string;
  updatedAt: string;
}

export const STATUSES: StatusValue[] = ["open", "planned", "in-progress", "done", "closed"];
export const STATUS_FILTER_TABS = ["all", ...STATUSES] as const;
