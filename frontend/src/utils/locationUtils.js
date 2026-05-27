/**
 * 地名处理工具
 */

// 检查用户输入是否匹配预设城市（不区分大小写）
// 例如输入 "wellington" 会匹配到 "Wellington"
export function matchCityKey(name, cityMap) {
  if (!name?.trim()) return null;
  const normalized = name.trim().toLowerCase();
  return (
    Object.keys(cityMap).find((key) => key.toLowerCase() === normalized) ||
    null
  );
}

// 统一地名显示：能匹配预设城市就用标准名，否则用用户输入
export function resolveLocationLabel(searchText, cityMap) {
  const key = matchCityKey(searchText, cityMap);
  return key || searchText.trim();
}

// 没有实时数据时，根据静态洪水等级估算一个基准降雨量（Simulation 兜底用）
export function floodRiskToBaselineMm(floodRisk) {
  if (floodRisk === 'High') return 8;
  if (floodRisk === 'Medium') return 4;
  return 1;
}
