const express = require("express");
const router = express.Router();

const {
  createTrafficData,
  getAllTrafficData,
  getTrafficAlerts,
  getTrafficStats,
  getByDistrict,
  getHourlyTrend,
  getIncidents,
  getRoadTypes,
} = require("../controllers/trafficController");

router.post("/", createTrafficData);
router.get("/", getAllTrafficData);
router.get("/alerts", getTrafficAlerts);
router.get("/stats", getTrafficStats);
router.get("/by-district", getByDistrict);
router.get("/hourly", getHourlyTrend);
router.get("/incidents", getIncidents);
router.get("/road-types", getRoadTypes);

module.exports = router;
