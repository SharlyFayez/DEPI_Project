const axios = require("axios");

const API_URL = process.env.API_URL || "http://localhost:5000/api/traffic";

// ── Cairo Locations ────────────────────────────────────────────
const cairoLocations = [
  { location: "Tahrir Square",             district: "Downtown Cairo", roadType: "URBAN"    },
  { location: "Ramses Square",             district: "Downtown Cairo", roadType: "URBAN"    },
  { location: "October 6 Bridge",          district: "Downtown Cairo", roadType: "BRIDGE"   },
  { location: "Kasr El Nil Bridge",        district: "Downtown Cairo", roadType: "BRIDGE"   },
  { location: "Port Said Street",          district: "Downtown Cairo", roadType: "ARTERIAL" },
  { location: "Corniche El Nil - Maadi",   district: "Maadi",          roadType: "ARTERIAL" },
  { location: "Maadi Ring Road",           district: "Maadi",          roadType: "HIGHWAY"  },
  { location: "Road 9 - Maadi",            district: "Maadi",          roadType: "ARTERIAL" },
  { location: "Abbas El Akkad St",         district: "Nasr City",      roadType: "ARTERIAL" },
  { location: "Nasr Road",                 district: "Nasr City",      roadType: "ARTERIAL" },
  { location: "Mostafa El Nahas St",       district: "Nasr City",      roadType: "ARTERIAL" },
  { location: "Salah Salem Road",          district: "East Cairo",     roadType: "HIGHWAY"  },
  { location: "Ring Road - East",          district: "East Cairo",     roadType: "HIGHWAY"  },
  { location: "Autostrad Road",            district: "East Cairo",     roadType: "HIGHWAY"  },
  { location: "Heliopolis - Merghany St",  district: "Heliopolis",     roadType: "ARTERIAL" },
  { location: "Kobri El Qubba",            district: "Heliopolis",     roadType: "BRIDGE"   },
  { location: "Orouba Street",             district: "Heliopolis",     roadType: "ARTERIAL" },
  { location: "Sudan St - Mohandiseen",    district: "Mohandiseen",    roadType: "ARTERIAL" },
  { location: "Lebanon St - Mohandiseen",  district: "Mohandiseen",    roadType: "ARTERIAL" },
  { location: "Zamalek Bridge",            district: "Zamalek",        roadType: "BRIDGE"   },
  { location: "26 July Corridor",          district: "Zamalek",        roadType: "ARTERIAL" },
  { location: "Shubra Road",               district: "Shubra",         roadType: "ARTERIAL" },
  { location: "Imbaba Bridge",             district: "Imbaba",         roadType: "BRIDGE"   },
  { location: "Giza Square",               district: "Giza",           roadType: "URBAN"    },
  { location: "Pyramids Road",             district: "Giza",           roadType: "ARTERIAL" },
  { location: "Cairo-Alex Desert Road",    district: "Giza",           roadType: "HIGHWAY"  },
];

const weatherOptions  = ["CLEAR","CLEAR","CLEAR","DUSTY","RAINY","FOGGY"];
const incidentOptions = ["NONE","NONE","NONE","NONE","ACCIDENT","CONSTRUCTION","BREAKDOWN"];

function getTimeFactor() {
  const h = new Date().getHours();
  if ((h >= 7 && h <= 10) || (h >= 13 && h <= 15) || (h >= 17 && h <= 20)) return 1.4;
  if (h >= 0 && h <= 5) return 0.4;
  return 1.0;
}

function generateTrafficData() {
  const spot       = cairoLocations[Math.floor(Math.random() * cairoLocations.length)];
  const tf         = getTimeFactor();
  const roadMod    = { HIGHWAY: 1.5, ARTERIAL: 1.0, URBAN: 1.2, BRIDGE: 0.8 };
  const mod        = roadMod[spot.roadType] || 1.0;
  const vehicleCount    = Math.min(200, Math.floor(Math.random() * 120 * tf * mod));
  const averageSpeed    = Math.max(5, Math.floor(Math.random() * 90 - vehicleCount * 0.3));
  const incidentType    = incidentOptions[Math.floor(Math.random() * incidentOptions.length)];
  const weatherCondition = weatherOptions[Math.floor(Math.random() * weatherOptions.length)];

  let congestionLevel = "LOW";
  if (vehicleCount > 90 || averageSpeed < 15)       congestionLevel = "HIGH";
  else if (vehicleCount > 45 || averageSpeed < 35)  congestionLevel = "MEDIUM";

  return {
    location: spot.location,
    district: spot.district,
    roadType: spot.roadType,
    vehicleCount,
    averageSpeed,
    congestionLevel,
    incidentType,
    weatherCondition,
  };
}

async function sendTrafficData() {
  try {
    const data = generateTrafficData();
    await axios.post(API_URL, data);
    console.log(`[${new Date().toLocaleTimeString()}] ${data.location} | ${data.vehicleCount} vehicles | ${data.congestionLevel}`);
  } catch (err) {
    console.error("Error:", err.message);
  }
}

(async () => {
  console.log("Cairo Traffic Simulator started — seeding 30 initial records...");
  for (let i = 0; i < 30; i++) await sendTrafficData();
  console.log("Seed complete. Streaming every 3s...");
  setInterval(sendTrafficData, 3000);
})();
