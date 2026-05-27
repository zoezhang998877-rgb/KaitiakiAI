/**
 * 灾害数据 API 服务层
 * 负责：地理编码、地震数据、天气/降雨数据
 * 优先走后端代理 /api/...，失败则直接访问外部 API
 */
import {
  getEarthquakeStatus,
  getFloodRiskFromPrecipitation
} from '../utils/riskLevels';

// 先尝试本地后端代理，代理不可用再直连外部 API
async function fetchWithProxy(proxyPath, directUrl, options = {}) {
  try {
    const proxyResponse = await fetch(proxyPath, options);
    if (proxyResponse.ok) {
      return proxyResponse;
    }
  } catch (error) {
    console.warn('Proxy unavailable, using direct API', error);
  }

  return fetch(directUrl, options);
}

// 计算两个经纬度之间的直线距离（单位：公里）
export function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // 地球半径
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * 把用户输入的地名转成经纬度（OpenStreetMap Nominatim）
 * @returns { lat, lon, displayName } 或 null（找不到时）
 */
export async function geocodeLocation(query) {
  const directUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
    query
  )},New Zealand&format=json&limit=1`;

  const response = await fetchWithProxy(
    `/api/geocode?q=${encodeURIComponent(query)}`,
    directUrl,
    {
      headers: {
        Accept: 'application/json'
      }
    }
  );

  if (!response.ok) {
    throw new Error('Geocoding request failed');
  }

  const data = await response.json();
  if (!data.length) {
    return null;
  }

  return {
    lat: parseFloat(data[0].lat),
    lon: parseFloat(data[0].lon),
    displayName: query.trim()
  };
}

/**
 * 从 GeoNet 获取地震数据，筛选出距离该点 100km 以内的地震
 */
export async function fetchEarthquakeData(lat, lon) {
  try {
    const response = await fetchWithProxy(
      '/api/geonet/quakes',
      'https://api.geonet.org.nz/quake?MMI=3',
      {
        headers: {
          Accept: 'application/vnd.geo+json;version=2'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Earthquake request failed');
    }

    const data = await response.json();

    // 只保留 100 公里范围内的地震
    const nearbyQuakes = data.features.filter((quake) => {
      const quakeLon = quake.geometry.coordinates[0];
      const quakeLat = quake.geometry.coordinates[1];
      const distance = getDistanceKm(lat, lon, quakeLat, quakeLon);
      return distance <= 100;
    });

    let maxMagnitude = 0;

    nearbyQuakes.forEach((quake) => {
      const mag = quake.properties.magnitude;
      if (mag != null && mag > maxMagnitude) {
        maxMagnitude = mag;
      }
    });

    const status = getEarthquakeStatus(nearbyQuakes.length, maxMagnitude);

    return {
      nearbyCount: nearbyQuakes.length,
      maxMagnitude,
      status // Low / Medium / High
    };
  } catch (error) {
    console.error(error);
    return {
      nearbyCount: 0,
      maxMagnitude: 0,
      status: 'Unable to load data'
    };
  }
}

/**
 * 从 Open-Meteo 获取降雨与预报，估算洪水风险
 */
export async function fetchHazardData(lat, lon) {
  try {
    const directUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=precipitation&daily=precipitation_sum&forecast_days=3&timezone=auto`;

    const response = await fetchWithProxy(
      `/api/weather?lat=${lat}&lon=${lon}`,
      directUrl
    );

    if (!response.ok) {
      throw new Error('Weather request failed');
    }

    const data = await response.json();
    const currentRain = data.current?.precipitation ?? 0;           // 当前降雨 mm
    const dailyForecast = data.daily?.precipitation_sum ?? [];
    const next24h = dailyForecast[0] ?? 0;                          // 未来 24 小时
    const threeDayTotal = dailyForecast
      .slice(0, 3)
      .reduce((sum, value) => sum + (value ?? 0), 0);               // 3 天总量

    // 取当前、24h、日均的最大值作为「有效降雨量」来算洪水风险
    const effectiveRain = Math.max(currentRain, next24h, threeDayTotal / 3);
    const floodRisk = getFloodRiskFromPrecipitation(effectiveRain);

    return {
      floodRisk,
      precipitation: currentRain,
      forecast24h: next24h,
      forecast3DayTotal: threeDayTotal,
      effectivePrecipitation: effectiveRain
    };
  } catch (error) {
    console.error(error);
    return {
      floodRisk: 'Unable to load data',
      precipitation: 0,
      forecast24h: 0,
      forecast3DayTotal: 0,
      effectivePrecipitation: 0
    };
  }
}

// 同时拉取地震 + 天气（并行请求，更快）
export async function loadHazardForCoordinates(lat, lon) {
  const [earthquakeData, hazardData] = await Promise.all([
    fetchEarthquakeData(lat, lon),
    fetchHazardData(lat, lon)
  ]);

  return { earthquakeData, hazardData };
}
