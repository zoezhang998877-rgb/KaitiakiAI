/**
 * 把一个地点的原始 API 数据，整理成页面展示用的「指标对象」
 */
import { calculateRiskScore, getOverallRisk, getRiskLevel } from './riskLevels';

export function buildLocationMetrics(displayName, earthquakeData, hazardData) {
  const floodRisk = hazardData?.floodRisk ?? 'No data';
  const earthquakeRisk = earthquakeData?.status ?? 'No data';
  const score = calculateRiskScore(floodRisk, earthquakeRisk);

  return {
    displayName,
    floodRisk,
    earthquakeRisk,
    precipitation: hazardData?.precipitation ?? 0,
    forecast24h: hazardData?.forecast24h ?? 0,
    forecast3DayTotal: hazardData?.forecast3DayTotal ?? 0,
    effectivePrecipitation: hazardData?.effectivePrecipitation ?? 0,
    nearbyCount: earthquakeData?.nearbyCount ?? 0,
    maxMagnitude: earthquakeData?.maxMagnitude ?? 0,
    overallRisk: getOverallRisk(earthquakeRisk, floodRisk),
    riskScore: score,
    riskLevel: getRiskLevel(score)
  };
}
