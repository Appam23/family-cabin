import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../../server/app";

describe("project routes", () => {
  it("requires authentication to list projects", async () => {
    const response = await request(app).get("/api/v1/projects");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "Authentication required" });
  });

  it("rejects project creation with missing required fields", async () => {
    const response = await request(app).post("/api/v1/projects").send({});

    expect(response.status).toBe(401);
  });

  it("requires authentication to edit or delete a project", async () => {
    const editResponse = await request(app)
      .patch("/api/v1/projects/example-id")
      .send({ title: "Updated title" });
    const deleteResponse = await request(app).delete(
      "/api/v1/projects/example-id"
    );

    expect(editResponse.status).toBe(401);
    expect(deleteResponse.status).toBe(401);
  });
});
