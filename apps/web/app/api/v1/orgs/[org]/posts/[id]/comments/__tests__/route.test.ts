import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const makeDate = (offset: number) => new Date(Date.now() - offset * 1000);

const mockOrg = { id: "org-1" };
const mockPost = { id: "post-1" };
const makeComment = (n: number) => ({
  id: `comment-${n}`,
  body: `Comment ${n}`,
  authorEmail: "user@example.com",
  authorName: `User ${n}`,
  postId: "post-1",
  createdAt: makeDate(100 - n),
});

vi.mock("@/lib/env", () => ({}));
vi.mock("@/lib/auth", () => ({ verifyAdminAccess: vi.fn().mockResolvedValue(null) }));
vi.mock("@/lib/webhooks", () => ({ dispatchWebhook: vi.fn() }));

const mockPrisma = {
  organization: { findUnique: vi.fn() },
  feedbackPost: { findFirst: vi.fn() },
  feedbackComment: { count: vi.fn(), findMany: vi.fn(), create: vi.fn() },
};

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

const makeParams = (org: string, id: string) =>
  ({ params: Promise.resolve({ org, id }) } as { params: Promise<{ org: string; id: string }> });

describe("comments GET — cursor pagination", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.organization.findUnique.mockResolvedValue(mockOrg);
    mockPrisma.feedbackPost.findFirst.mockResolvedValue(mockPost);
  });

  it("returns up to limit comments and hasMore: true when over limit", async () => {
    const comments = Array.from({ length: 51 }, (_, i) => makeComment(i));
    mockPrisma.feedbackComment.count.mockResolvedValue(60);
    mockPrisma.feedbackComment.findMany.mockResolvedValue(comments);

    const { GET } = await import("../route");

    const req = new NextRequest("http://localhost/api/v1/orgs/test-org/posts/post-1/comments?limit=50");
    const res = await GET(req, makeParams("test-org", "post-1"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data).toHaveLength(50);
    expect(body.pagination.hasMore).toBe(true);
    expect(body.pagination.nextCursor).toBeTruthy();
    expect(body.pagination.total).toBe(60);
  });

  it("returns hasMore: false when at or under limit", async () => {
    const comments = Array.from({ length: 10 }, (_, i) => makeComment(i));
    mockPrisma.feedbackComment.count.mockResolvedValue(10);
    mockPrisma.feedbackComment.findMany.mockResolvedValue(comments);

    const { GET } = await import("../route");

    const req = new NextRequest("http://localhost/api/v1/orgs/test-org/posts/post-1/comments");
    const res = await GET(req, makeParams("test-org", "post-1"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data).toHaveLength(10);
    expect(body.pagination.hasMore).toBe(false);
    expect(body.pagination.nextCursor).toBeNull();
  });

  it("caps limit at 100", async () => {
    mockPrisma.feedbackComment.count.mockResolvedValue(0);
    mockPrisma.feedbackComment.findMany.mockResolvedValue([]);

    const { GET } = await import("../route");

    const req = new NextRequest("http://localhost/api/v1/orgs/test-org/posts/post-1/comments?limit=500");
    await GET(req, makeParams("test-org", "post-1"));

    expect(mockPrisma.feedbackComment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 101 }) // limit(100) + 1 for hasMore probe
    );
  });
});

describe("comments POST — validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.organization.findUnique.mockResolvedValue(mockOrg);
    mockPrisma.feedbackPost.findFirst.mockResolvedValue(mockPost);
  });

  it("returns 400 with errors array when body is missing", async () => {
    const { POST } = await import("../route");

    const req = new NextRequest("http://localhost/api/v1/orgs/test-org/posts/post-1/comments", {
      method: "POST",
      body: JSON.stringify({}),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req, makeParams("test-org", "post-1"));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(Array.isArray(data.errors)).toBe(true);
    expect(data.errors.some((e: { field: string }) => e.field === "body")).toBe(true);
  });

  it("returns 400 when email is invalid", async () => {
    const { POST } = await import("../route");

    const req = new NextRequest("http://localhost/api/v1/orgs/test-org/posts/post-1/comments", {
      method: "POST",
      body: JSON.stringify({ body: "Great idea", authorEmail: "not-an-email" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req, makeParams("test-org", "post-1"));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.errors.some((e: { field: string }) => e.field === "authorEmail")).toBe(true);
  });
});
