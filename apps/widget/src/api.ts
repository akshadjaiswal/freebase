// Fetch helper — attaches JWT identity header when identified

let _identityToken: string | null = null;
let _baseUrl: string = "";

export function setBaseUrl(url: string) {
  _baseUrl = url;
}

export function setIdentityToken(token: string | null) {
  _identityToken = token;
}

export function getIdentityToken(): string | null {
  return _identityToken;
}

function buildHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...extra,
  };
  if (_identityToken) {
    headers["X-Freebase-User"] = _identityToken;
  }
  return headers;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T | null> {
  try {
    const res = await fetch(`${_baseUrl}${path}`, {
      ...options,
      headers: buildHeaders(options.headers as Record<string, string>),
    });
    if (!res.ok) return null;
    return res.json() as Promise<T>;
  } catch {
    return null;
  }
}

export interface OrgConfig {
  name: string;
  slug: string;
  accentColor: string;
  categories: Array<{ id: string; name: string }>;
}

export async function fetchOrgConfig(org: string): Promise<OrgConfig | null> {
  return apiFetch<OrgConfig>(`/api/widget/${org}/config`);
}

export async function identifyUser(
  org: string,
  jwt: string
): Promise<{ token: string } | null> {
  return apiFetch<{ token: string }>(`/api/widget/${org}/identify`, {
    method: "POST",
    body: JSON.stringify({ jwt }),
  });
}

export interface ChangelogEntry {
  id: string;
  title: string;
  slug: string;
  label: string;
  publishedAt: string;
  excerpt: string;
}

export async function fetchRecentChangelog(
  org: string
): Promise<ChangelogEntry[]> {
  const data = await apiFetch<{ data: ChangelogEntry[] }>(
    `/api/v1/orgs/${org}/changelog?status=published&limit=5`
  );
  return data?.data ?? [];
}

export interface RoadmapData {
  planned: RoadmapItem[];
  inProgress: RoadmapItem[];
  done: RoadmapItem[];
}

export interface RoadmapItem {
  id: string;
  title: string;
  votes: number;
}

export async function fetchRoadmap(org: string): Promise<RoadmapData | null> {
  return apiFetch<RoadmapData>(`/api/v1/orgs/${org}/roadmap`);
}

export async function submitFeedback(
  org: string,
  payload: {
    title: string;
    description?: string;
    categoryId?: string;
    authorEmail: string;
    authorName?: string;
  }
): Promise<boolean> {
  const res = await apiFetch(`/api/v1/orgs/${org}/posts`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res !== null;
}
