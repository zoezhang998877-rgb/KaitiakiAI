# KaitiakiAI

Urban hazard intelligence platform for New Zealand — search any location and view live **flood** and **earthquake** risk, compare two places, and run rainfall scenarios.

> **Status:** Work in progress · actively developed for coursework / portfolio

## Features

- **Hazard Map** — geocoded search, interactive map, live risk summary
- **Risk Dashboard** — charts for risk levels, precipitation, and seismic activity
- **Location Comparison** — side-by-side live comparison of two NZ locations
- **Scenario Simulation** — model flood risk under increased rainfall

## Tech Stack

| Layer | Technologies |
|--------|----------------|
| Frontend | React 19, Vite, React Router, Leaflet, Recharts |
| Backend | Node.js, Express (API proxy) |
| Data | GeoNet, Open-Meteo, OpenStreetMap Nominatim |

## Quick Start

### 1. Backend (port 5001)

```bash
cd backend
npm install
node server.js
```

### 2. Frontend (port 5173)

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The dev server proxies `/api` to the backend.

### Production build

```bash
cd frontend && npm run build
```

## Project Structure

```
Kaitiaki-ai/
├── frontend/src/
│   ├── context/       # Global hazard state
│   ├── pages/         # Map, Dashboard, Compare, Simulation
│   ├── services/      # API calls
│   └── components/    # UI & map
└── backend/server.js  # Geocode / earthquake / weather proxy
```

## Roadmap

- [ ] Deploy frontend + backend
- [ ] Improve flood risk model
- [ ] Mobile-responsive polish

## Zheng Zhang — https://github.com/zoezhang998877-rgb
## License

MIT (or your choice — update before publishing)
