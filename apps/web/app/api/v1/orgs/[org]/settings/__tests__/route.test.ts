import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockPrismaOrg = {
  id: "org-1",
  name: "Test Org",
  slug: "test-org",
  accentColor: "#10b981",
  secretKey: "sk_test",
};

const mockSession = {
  org: mockPrismaOrg,
  user: { id: "user-1" },
};

// Top-level mocks so vitest can hoist them before imports
vi.mock("@/lib/env", () => ({}));
vi.mock("next/cache", () => ({ revalidateTag: vi.fn() }));
vi.mock("@/lib/logger", () => ({ logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn() } }));
vi.mock("@/lib/auth", () => ({ verifyAdminAccess: vi.fn().mockResolvedValue(mockSession) }));

const mockDeleteUser = vi.fn();
const mockGetUser = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockImplementation(() =>
    Promise.resolve({ auth: { getUser: mockGetUser } })
  ),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn().mockImplementation(() => ({
    auth: { admin: { deleteUser: mockDeleteUser } },
  })),
}));

const mockOrgDelete = vi.fn().mockResolvedValue(mockPrismaOrg);
const mockOrgUpdate = vi.fn().mockResolvedValue(mockPrismaOrg);

vi.mock("@/lib/prisma", () => ({
  prisma: {
    organization: { delete: mockOrgDelete, update: mockOrgUpdate },
  },
}));

const makeParams = (org: string) =>
  ({ params: Promise.resolve({ org }) } as { params: Promise<{ org: string }> });

describe("settings DELETE — atomicity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOrgDelete.mockResolvedValue(mockPrismaOrg);
    mockOrgUpdate.mockResolvedValue(mockPrismaOrg);
  });

  it("returns 204 and calls Supabase delete before Prisma delete", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockDeleteUser.mockResolvedValue({ error: null });

    const { DELETE } = await import("../route");

    const req = new NextRequest("http://localhost/api/v1/orgs/test-org/settings", { method: "DELETE" });
    const res = await DELETE(req, makeParams("test-org"));

    expect(res.status).toBe(204);
    expect(mockDeleteUser).toHaveBeenCalledWith("user-1");
    // Supabase delete must be called before Prisma delete
    const deleteUserOrder = mockDeleteUser.mock.invocationCallOrder[0];
    const orgDeleteOrder = mockOrgDelete.mock.invocationCallOrder[0];
    expect(deleteUserOrder).toBeLessThan(orgDeleteOrder);
  });

  it("returns 500 and does NOT call prisma.organization.delete when Supabase fails", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockDeleteUser.mockResolvedValue({ error: { message: "Auth service unavailable" } });

    const { DELETE } = await import("../route");

    const req = new NextRequest("http://localhost/api/v1/orgs/test-org/settings", { method: "DELETE" });
    const res = await DELETE(req, makeParams("test-org"));

    expect(res.status).toBe(500);
    expect(mockOrgDelete).not.toHaveBeenCalled();
  });

  it("PATCH with invalid accentColor returns 400 with errors array listing the field", async () => {
    const { PATCH } = await import("../route");

    const req = new NextRequest("http://localhost/api/v1/orgs/test-org/settings", {
      method: "PATCH",
      body: JSON.stringify({ accentColor: "not-a-color" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await PATCH(req, makeParams("test-org"));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(Array.isArray(body.errors)).toBe(true);
    expect(body.errors.some((e: { field: string }) => e.field === "accentColor")).toBe(true);
  });
});
