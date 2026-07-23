import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

const mockOrgRestricted = { id: "org-1", allowedOrigins: ["https://good.com"] };

vi.mock("@/lib/env", () => ({}));
vi.mock("@/lib/auth", () => ({ verifyAdminAccess: vi.fn().mockResolvedValue(null) }));
vi.mock("@/lib/webhooks", () => ({ dispatchWebhook: vi.fn() }));
vi.mock("next/cache", () => ({ revalidateTag: vi.fn() }));

const mockPrisma = {
  organization: { findUnique: vi.fn() },
  feedbackPost: { findMany: vi.fn(), count: vi.fn(), create: vi.fn() },
  category: { findFirst: vi.fn() },
};

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

const makeParams = (org: string) =>
  ({ params: Promise.resolve({ org }) } as { params: Promise<{ org: string }> });

describe("posts POST — origin allowlist", () => {
  const originalAppUrl = process.env.NEXT_PUBLIC_APP_URL;

  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.organization.findUnique.mockResolvedValue(mockOrgRestricted);
    process.env.NEXT_PUBLIC_APP_URL = "https://freebase.vercel.app";
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_APP_URL = originalAppUrl;
  });

  it("rejects with 403 when Origin header does not match the org's allowlist", async () => {
    const { POST } = await import("../route");

    const req = new NextRequest("http://localhost/api/v1/orgs/test-org/posts", {
      method: "POST",
      body: JSON.stringify({ title: "Some feedback title", authorEmail: "user@example.com" }),
      headers: { "Content-Type": "application/json", Origin: "https://evil.com" },
    });
    const res = await POST(req, makeParams("test-org"));

    expect(res.status).toBe(403);
    expect(mockPrisma.feedbackPost.create).not.toHaveBeenCalled();
  });

  it("allows when Origin header matches the org's allowlist", async () => {
    mockPrisma.feedbackPost.create.mockResolvedValue({
      id: "post-1",
      title: "Some feedback title",
      description: null,
      status: "open",
      voteCount: 0,
      pinned: false,
      authorEmail: "user@example.com",
      authorName: null,
      category: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      _count: { comments: 0 },
    });

    const { POST } = await import("../route");

    const req = new NextRequest("http://localhost/api/v1/orgs/test-org/posts", {
      method: "POST",
      body: JSON.stringify({ title: "Some feedback title", authorEmail: "user@example.com" }),
      headers: { "Content-Type": "application/json", Origin: "https://good.com" },
    });
    const res = await POST(req, makeParams("test-org"));

    expect(res.status).toBe(201);
  });

  it("allows when no Origin header is sent (same-origin/server call)", async () => {
    mockPrisma.feedbackPost.create.mockResolvedValue({
      id: "post-1",
      title: "Some feedback title",
      description: null,
      status: "open",
      voteCount: 0,
      pinned: false,
      authorEmail: "user@example.com",
      authorName: null,
      category: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      _count: { comments: 0 },
    });

    const { POST } = await import("../route");

    const req = new NextRequest("http://localhost/api/v1/orgs/test-org/posts", {
      method: "POST",
      body: JSON.stringify({ title: "Some feedback title", authorEmail: "user@example.com" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req, makeParams("test-org"));

    expect(res.status).toBe(201);
  });

  it("allows a same-origin call from the app's own public board even when its origin isn't in the allowlist", async () => {
    mockPrisma.feedbackPost.create.mockResolvedValue({
      id: "post-1",
      title: "Some feedback title",
      description: null,
      status: "open",
      voteCount: 0,
      pinned: false,
      authorEmail: "user@example.com",
      authorName: null,
      category: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      _count: { comments: 0 },
    });

    const { POST } = await import("../route");

    const req = new NextRequest("http://localhost/api/v1/orgs/test-org/posts", {
      method: "POST",
      body: JSON.stringify({ title: "Some feedback title", authorEmail: "user@example.com" }),
      headers: { "Content-Type": "application/json", Origin: "https://freebase.vercel.app" },
    });
    const res = await POST(req, makeParams("test-org"));

    expect(res.status).toBe(201);
  });
});
