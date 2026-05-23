# 🚦 Cairo Intelligent Traffic Management System

Real-time traffic monitoring dashboard for Cairo Governorate — built with React + Vite (frontend), Node.js + Express + Prisma (backend), PostgreSQL (database), and a live data simulator.

---

## 📁 Project Structure

```
exe/
├── front/          React + Vite dashboard
├── back/           Node.js + Express + Prisma API
├── simulator/      Cairo traffic data simulator
├── nginx/          Reverse-proxy config
├── docker-compose.yml
└── README.md
```

---

## 🗺️ Cairo Locations Covered (26 sensors)

Downtown Cairo · Maadi · Nasr City · East Cairo · Heliopolis · Mohandiseen · Zamalek · Shubra · Imbaba · Giza

---

## 🚀 Quick Start (Docker)

```bash
docker-compose up --build
```

Then open → **http://localhost**

---

## 🔧 Manual Start

### 1. Database
```bash
# Start PostgreSQL locally and set DATABASE_URL in back/.env
```

### 2. Backend
```bash
cd back
npm install
npx prisma migrate deploy
npm run dev          # runs on :5000
```

### 3. Frontend
```bash
cd front
npm install
npm run dev          # runs on :5173
```

### 4. Simulator
```bash
cd simulator
npm install
node simulator.js    # seeds 30 records, then streams every 3s
```

---

## 🌐 API Endpoints

| Method | Endpoint                    | Description                        |
|--------|-----------------------------|------------------------------------|
| GET    | /api/traffic                | All traffic records (last 100)     |
| POST   | /api/traffic                | Create a traffic record            |
| GET    | /api/traffic/stats          | Aggregated stats & KPIs            |
| GET    | /api/traffic/alerts         | HIGH congestion + incident alerts  |
| GET    | /api/traffic/by-district    | Per-district aggregates            |
| GET    | /api/traffic/hourly         | 24-hour trend data                 |
| GET    | /api/traffic/incidents      | Active incidents                   |
| GET    | /api/traffic/road-types     | Stats grouped by road type         |
| GET    | /health                     | Server health check                |

---

## 📊 Dashboard Sections

- **Weather Banner** — dominant weather condition across Cairo sensors  
- **Stats Cards** — total records, high congestion zones, avg vehicles, avg speed, active incidents  
- **Live Traffic Flow** — real-time area chart of vehicle counts  
- **Road Type Load** — progress bars for Highway / Arterial / Urban / Bridge  
- **24-Hour Trend** — colour-coded bar chart (low=cyan, medium=amber, high=red)  
- **District Overview** — cards for each Cairo district with speed bars  
- **Congestion Alerts** — live table of HIGH-congestion locations  
- **Active Incidents** — accidents, construction, breakdowns  

---

## 🗄️ Database Schema

```prisma
model TrafficData {
  id               Int      @id @default(autoincrement())
  location         String             // e.g. "Tahrir Square"
  district         String             // e.g. "Downtown Cairo"
  roadType         String             // HIGHWAY | ARTERIAL | URBAN | BRIDGE
  vehicleCount     Int
  averageSpeed     Float
  congestionLevel  String             // LOW | MEDIUM | HIGH
  incidentType     String             // NONE | ACCIDENT | CONSTRUCTION | BREAKDOWN
  weatherCondition String             // CLEAR | DUSTY | RAINY | FOGGY
  createdAt        DateTime @default(now())
}
```
