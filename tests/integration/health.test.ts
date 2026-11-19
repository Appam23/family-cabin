import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../../server/app";

describe("health endpoint", () => {
  it("reports that the API is available", async () => {
    const response = await request(app).get("/api/v1/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });
});
