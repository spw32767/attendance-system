import { describe, expect, it } from "vitest";
import { allowedRolesFor, isProtectedPath } from "../src/modules/auth/auth.middleware";

describe("isProtectedPath", () => {
  it("treats /api/admin/* as protected", () => {
    expect(isProtectedPath("/api/admin/forms")).toBe(true);
    expect(isProtectedPath("/api/admin/users")).toBe(true);
    expect(isProtectedPath("/api/admin/submissions/12?foo=bar")).toBe(true);
  });

  it("leaves auth + public + health endpoints open", () => {
    expect(isProtectedPath("/api/auth/login")).toBe(false);
    expect(isProtectedPath("/api/auth/me")).toBe(false);
    expect(isProtectedPath("/api/auth/logout")).toBe(false);
    expect(isProtectedPath("/api/public/forms/some-path/submissions")).toBe(false);
    expect(isProtectedPath("/health")).toBe(false);
  });
});

describe("allowedRolesFor", () => {
  it("restricts user management + audit to super_admin/admin", () => {
    expect(allowedRolesFor("/api/admin/users")).toEqual(["super_admin", "admin"]);
    expect(allowedRolesFor("/api/admin/users/5/reset-password")).toEqual([
      "super_admin",
      "admin"
    ]);
    expect(allowedRolesFor("/api/admin/login-logs")).toEqual(["super_admin", "admin"]);
    expect(allowedRolesFor("/api/admin/sso-accounts")).toEqual(["super_admin", "admin"]);
  });

  it("lets scanner reach QR scan + claim status", () => {
    expect(allowedRolesFor("/api/admin/claims/scan")).toContain("scanner");
    expect(allowedRolesFor("/api/admin/claims/abc-123/status")).toContain("scanner");
    expect(allowedRolesFor("/api/admin/claims")).toContain("scanner");
  });

  it("allows any authed role on self-service /me", () => {
    expect(allowedRolesFor("/api/admin/me/password")).toEqual([
      "super_admin",
      "admin",
      "staff",
      "scanner"
    ]);
  });

  it("keeps scanner OUT of the default admin surface (forms, submissions)", () => {
    expect(allowedRolesFor("/api/admin/forms")).toEqual(["super_admin", "admin", "staff"]);
    expect(allowedRolesFor("/api/admin/submissions")).not.toContain("scanner");
  });
});
