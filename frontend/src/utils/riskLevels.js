/**
 * 风险等级相关的计算工具
 * 把降雨量、地震次数等原始数据，转换成 Low / Medium / High
 */

// 根据降雨量（毫米）判断洪水风险
export function getFloodRiskFromPrecipitation(mm) {
  if (mm > 7) return 'High';
  if (mm > 3) return 'Medium';
  return 'Low';
}

// 根据附近地震数量和最大震级，判断地震活动等级
export function getEarthquakeStatus(nearbyCount, maxMagnitude) {
  if (nearbyCount >= 5 || maxMagnitude >= 5) return 'High';
  if (nearbyCount >= 2 || maxMagnitude >= 4) return 'Medium';
  return 'Low';
}

// 综合洪水 + 地震，得出总体风险
export function getOverallRisk(eqStatus, flood) {
  if (eqStatus === 'High' || flood === 'High') return 'High';
  if (eqStatus === 'Medium' || flood === 'Medium') return 'Medium';
  if (eqStatus === 'No data' || flood === 'No data') return 'No data';
  if (
    eqStatus === 'Unable to load data' ||
    flood === 'Unable to load data'
  ) {
    return 'Partial data';
  }
  return 'Low';
}

// 把风险文字转成数字，方便画图表（Low=1, Medium=2, High=3）
export function riskToNumber(level) {
  if (level === 'High') return 3;
  if (level === 'Medium') return 2;
  if (level === 'Low') return 1;
  return 0;
}

// 把风险转成 0~1 的分数（Simulation 页面用）
export function riskToScore(level) {
  if (level === 'High') return 0.75;
  if (level === 'Medium') return 0.52;
  return 0.25;
}

// 计算综合风险分数（洪水权重 0.6，地震权重 0.4）
export function calculateRiskScore(flood, earthquake) {
  let score = 0;

  if (flood === 'High') score += 0.6;
  else if (flood === 'Medium') score += 0.4;
  else if (flood === 'Low') score += 0.2;

  if (earthquake === 'High') score += 0.4;
  else if (earthquake === 'Medium') score += 0.2;
  else if (earthquake === 'Low') score += 0.1;

  return score;
}

// 根据分数得出总体等级
export function getRiskLevel(score) {
  if (score > 0.7) return 'High';
  if (score > 0.4) return 'Medium';
  return 'Low';
}

// 根据风险等级返回给用户的建议文字
export function getRecommendation(risk) {
  if (risk === 'High') {
    return 'Prepare an emergency plan and monitor official warnings closely.';
  }
  if (risk === 'Medium') {
    return 'Stay aware of local hazard updates and prepare basic emergency items.';
  }
  if (risk === 'Low') {
    return 'Current risk level is relatively low, but regular monitoring is still recommended.';
  }
  if (risk === 'Partial data') {
    return 'Some hazard data could not be loaded. Try searching again in a moment.';
  }
  return 'Search a location on the Hazard Map to load live data.';
}

// 返回 CSS 类名，用于给徽章上色
export function badgeClassForRisk(level) {
  if (level === 'High') return 'badge--high';
  if (level === 'Medium') return 'badge--medium';
  if (level === 'Low') return 'badge--low';
  return 'badge--neutral';
}
