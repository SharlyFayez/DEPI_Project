jest.mock("../src/prisma/client", () => ({
  trafficData: {},
}));

const request = require("supertest");
const app = require("../src/server");

describe("Health Check", () => {

  test("GET /health should return ok", async () => {

    const res = await request(app).get("/health");

    expect(res.statusCode).toBe(200);

    expect(res.body.status).toBe("ok");

  });

});