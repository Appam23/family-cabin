import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../../server/app";

describe("announcement routes", () => {
  it("requires authentication to list announcements", async () => {
    const response = await request(app).get("/api/v1/announcements");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "Authentication required" });
  });

  it("requires authentication to publish an announcement", async () => {
    const response = await request(app)
      .post("/api/v1/announcements")
      .send({ title: "Cabin weekend", body: "Bring supplies" });

    expect(response.status).toBe(401);
  });

  it("requires authentication to edit or remove an announcement", async () => {
    const editResponse = await request(app)
      .patch("/api/v1/announcements/example-id")
      .send({ title: "Updated title" });
    const deleteResponse = await request(app).delete(
      "/api/v1/announcements/example-id"
    );

    expect(editResponse.status).toBe(401);
    expect(deleteResponse.status).toBe(401);
  });
});
