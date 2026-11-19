import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../../server/app";

describe("account routes", () => {
  it("requires authentication to update account settings", async () => {
    const response = await request(app)
      .patch("/api/v1/users/me")
      .send({ name: "Updated name" });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "Authentication required" });
  });
});
