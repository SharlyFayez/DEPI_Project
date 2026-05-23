const prisma = require("../prisma/client");

// ── POST /api/traffic ──────────────────────────────────────────
exports.createTrafficData = async (req, res) => {
  try {
    const data = await prisma.trafficData.create({ data: req.body });
    res.status(201).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create traffic data" });
  }
};

// ── GET /api/traffic ───────────────────────────────────────────
exports.getAllTrafficData = async (req, res) => {
  try {
    const data = await prisma.trafficData.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch traffic data" });
  }
};

// ── GET /api/traffic/alerts ────────────────────────────────────
exports.getTrafficAlerts = async (req, res) => {
  try {
    const alerts = await prisma.trafficData.findMany({
      where: {
        OR: [
          { congestionLevel: "HIGH" },
          { averageSpeed: { lt: 15 } },
          { incidentType: { not: "NONE" } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    res.json(alerts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch alerts" });
  }
};

// ── GET /api/traffic/stats ─────────────────────────────────────
exports.getTrafficStats = async (req, res) => {
  try {
    const [totalRecords, highCongestion, mediumCongestion, activeIncidents, agg] =
      await Promise.all([
        prisma.trafficData.count(),
        prisma.trafficData.count({ where: { congestionLevel: "HIGH" } }),
        prisma.trafficData.count({ where: { congestionLevel: "MEDIUM" } }),
        prisma.trafficData.count({ where: { incidentType: { not: "NONE" } } }),
        prisma.trafficData.aggregate({
          _avg: { vehicleCount: true, averageSpeed: true },
        }),
      ]);

    res.json({
      totalRecords,
      highCongestion,
      mediumCongestion,
      activeIncidents,
      averageVehicleCount: agg._avg.vehicleCount || 0,
      averageSpeed: agg._avg.averageSpeed || 0,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
};

// ── GET /api/traffic/by-district ──────────────────────────────
exports.getByDistrict = async (req, res) => {
  try {
    const grouped = await prisma.trafficData.groupBy({
      by: ["district"],
      _count: { id: true },
      _avg: { vehicleCount: true, averageSpeed: true },
      orderBy: { _avg: { vehicleCount: "desc" } },
    });

    // Determine dominant congestion level per district
    const districts = await Promise.all(
      grouped.map(async (g) => {
        const latest = await prisma.trafficData.findFirst({
          where: { district: g.district },
          orderBy: { createdAt: "desc" },
          select: { congestionLevel: true, weatherCondition: true },
        });
        return {
          district: g.district,
          recordCount: g._count.id,
          avgVehicleCount: Math.round(g._avg.vehicleCount || 0),
          avgSpeed: parseFloat((g._avg.averageSpeed || 0).toFixed(1)),
          congestionLevel: latest?.congestionLevel || "LOW",
          weatherCondition: latest?.weatherCondition || "CLEAR",
        };
      })
    );

    res.json(districts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch district stats" });
  }
};

// ── GET /api/traffic/hourly ────────────────────────────────────
exports.getHourlyTrend = async (req, res) => {
  try {
    const rows = await prisma.$queryRaw`
      SELECT
        EXTRACT(HOUR FROM "createdAt")::int   AS hour,
        COUNT(*)::int                          AS total,
        ROUND(AVG("vehicleCount"))::int        AS avg_vehicles,
        ROUND(AVG("averageSpeed")::numeric, 1) AS avg_speed
      FROM "TrafficData"
      WHERE "createdAt" > NOW() - INTERVAL '24 hours'
      GROUP BY EXTRACT(HOUR FROM "createdAt")
      ORDER BY hour ASC
    `;
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch hourly trend" });
  }
};

// ── GET /api/traffic/incidents ─────────────────────────────────
exports.getIncidents = async (req, res) => {
  try {
    const incidents = await prisma.trafficData.findMany({
      where: { incidentType: { not: "NONE" } },
      orderBy: { createdAt: "desc" },
      take: 15,
    });
    res.json(incidents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch incidents" });
  }
};

// ── GET /api/traffic/road-types ────────────────────────────────
exports.getRoadTypes = async (req, res) => {
  try {
    const grouped = await prisma.trafficData.groupBy({
      by: ["roadType"],
      _count: { id: true },
      _avg: { vehicleCount: true, averageSpeed: true },
    });

    const result = grouped.map((g) => ({
      roadType: g.roadType,
      count: g._count.id,
      avgVehicles: Math.round(g._avg.vehicleCount || 0),
      avgSpeed: parseFloat((g._avg.averageSpeed || 0).toFixed(1)),
    }));

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch road types" });
  }
};
