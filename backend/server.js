// 后端：帮前端转发 API，顺便解决跨域。上线后也会把打包好的网页一起发出去
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5001;
const frontendDist = path.join(__dirname, '../frontend/dist');
const hasFrontend = fs.existsSync(path.join(frontendDist, 'index.html'));

app.use(cors());
app.use(express.json());

const NOMINATIM_HEADERS = {
  Accept: 'application/json',
  'User-Agent': 'KaitiakiAI/1.0 (education project)' // OSM 要求带这个
};

app.get('/', (req, res) => {
  if (hasFrontend) {
    return res.sendFile(path.join(frontendDist, 'index.html'));
  }
  res.send('KaitiakiAI backend is running');
});

// 地名 → 经纬度
app.get('/api/geocode', async (req, res) => {
  try {
    const query = req.query.q;

    if (!query) {
      return res.status(400).json({ error: 'Missing query parameter q' });
    }

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        query
      )},New Zealand&format=json&limit=1`,
      { headers: NOMINATIM_HEADERS }
    );

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Geocoding proxy failed' });
  }
});

// 地震 → GeoNet
app.get('/api/geonet/quakes', async (req, res) => {
  try {
    const response = await fetch('https://api.geonet.org.nz/quake?MMI=3', {
      headers: {
        Accept: 'application/vnd.geo+json;version=2'
      }
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Earthquake proxy failed' });
  }
});

// 天气 → Open-Meteo
app.get('/api/weather', async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ error: 'Missing lat or lon' });
    }

    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=precipitation&daily=precipitation_sum&forecast_days=3&timezone=auto`
    );

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Weather proxy failed' });
  }
});

// 有 frontend/dist 就把网页也一起提供（部署用）
if (hasFrontend) {
  app.use(express.static(frontendDist));
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
