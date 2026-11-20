import { describe, expect, it } from "vitest";
import { canManageResource } from "../../server/services/authorization";

describe("canManageResource", () => {
  it("allows the resource owner", () => {
    expect(canManageResource("member", "user-1", "user-1")).toBe(true);
  });

  it("allows an administrator", () => {
    expect(canManageResource("admin", "admin-1", "user-1")).toBe(true);
  });

  it("rejects a member who is neither owner nor administrator", () => {
    expect(canManageResource("member", "user-2", "user-1")).toBe(false);
  });
});
