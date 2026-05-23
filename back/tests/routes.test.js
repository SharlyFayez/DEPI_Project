jest.mock("../src/prisma/client", () => ({
  trafficData: {
    findMany: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
    groupBy: jest.fn(),
    findFirst: jest.fn(),
  },
  $queryRaw: jest.fn(),
}));

const request = require("supertest");
const app = require("../src/server");
const prisma = require("../src/prisma/client");

describe("Traffic Routes", () => {

  test("GET /api/traffic", async () => {
    prisma.trafficData.findMany.mockResolvedValue([
      {
        id: 1,
        location: "Tahrir",
      },
    ]);

    const res = await request(app).get("/api/traffic");

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
  });

  test("POST /api/traffic", async () => {
    prisma.trafficData.create.mockResolvedValue({
      id: 1,
      location: "Tahrir",
    });

    const res = await request(app)
      .post("/api/traffic")
      .send({
        location: "Tahrir",
      });

    expect(res.statusCode).toBe(201);
  });

  test("GET /api/traffic/stats", async () => {
    prisma.trafficData.count
      .mockResolvedValueOnce(100)
      .mockResolvedValueOnce(20)
      .mockResolvedValueOnce(30)
      .mockResolvedValueOnce(5);

    prisma.trafficData.aggregate.mockResolvedValue({
      _avg: {
        vehicleCount: 50,
        averageSpeed: 40,
      },
    });

    const res = await request(app).get("/api/traffic/stats");

    expect(res.statusCode).toBe(200);
    expect(res.body.totalRecords).toBe(100);
  });

});