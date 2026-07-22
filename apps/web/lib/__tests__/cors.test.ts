import { describe, it, expect } from "vitest";
import { corsHeaders, checkOriginAllowed } from "../cors";

function makeRequest(origin?: string): Request {
  const headers = new Headers();
  if (origin !== undefined) headers.set("origin", origin);
  return new Request("http://localhost/api/test", { headers });
}

describe("checkOriginAllowed", () => {
  it("allows when no Origin header and allowlist is empty", () => {
    expect(checkOriginAllowed(makeRequest(), [])).toEqual({ allowed: true });
  });

  it("allows when no Origin header even with a non-empty allowlist", () => {
    expect(checkOriginAllowed(makeRequest(), ["https://good.com"])).toEqual({ allowed: true });
  });

  it("allows when Origin present but allowlist is empty (unrestricted default)", () => {
    expect(checkOriginAllowed(makeRequest("https://evil.com"), [])).toEqual({ allowed: true });
  });

  it("rejects a mismatched Origin against a non-empty allowlist", () => {
    const result = checkOriginAllowed(makeRequest("https://evil.com"), ["https://good.com"]);
    expect(result).toEqual({ allowed: false, origin: "https://evil.com" });
  });

  it("allows a matching Origin", () => {
    expect(checkOriginAllowed(makeRequest("https://good.com"), ["https://good.com"])).toEqual({ allowed: true });
  });

  it("normalizes case and trailing slash when matching", () => {
    const result = checkOriginAllowed(makeRequest("HTTPS://Good.com/"), ["https://good.com"]);
    expect(result).toEqual({ allowed: true });
  });

  it("treats a missing/undefined allowedOrigins as unrestricted", () => {
    expect(checkOriginAllowed(makeRequest("https://evil.com"), undefined)).toEqual({ allowed: true });
  });
});

describe("corsHeaders", () => {
  it("echoes the request's Origin when present", () => {
    const headers = corsHeaders(makeRequest("https://good.com"), "GET, OPTIONS");
    expect(headers["Access-Control-Allow-Origin"]).toBe("https://good.com");
    expect(headers["Access-Control-Allow-Methods"]).toBe("GET, OPTIONS");
  });

  it("falls back to '*' when no Origin header is present", () => {
    const headers = corsHeaders(makeRequest(), "GET, OPTIONS");
    expect(headers["Access-Control-Allow-Origin"]).toBe("*");
  });
});
