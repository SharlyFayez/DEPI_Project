require("dotenv").config();

const express = require("express");
const cors = require("cors");

const trafficRoutes = require("./routes/trafficRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/traffic", trafficRoutes);

module.exports = app;