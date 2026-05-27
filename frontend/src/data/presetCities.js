/**
 * 快捷选城列表：只有名字和坐标，用于一键加载
 * 注意：风险数据仍然来自实时 API，这里不是写死的风险值
 */
export const presetCities = [
  { name: 'Hamilton', lat: -37.787, lon: 175.279 },
  { name: 'Wellington', lat: -41.2865, lon: 174.7762 },
  { name: 'Auckland', lat: -36.8485, lon: 174.7633 },
  { name: 'Christchurch', lat: -43.5321, lon: 172.6362 },
  { name: 'Tauranga', lat: -37.6878, lon: 176.1651 },
  { name: 'Dunedin', lat: -45.8742, lon: 170.5036 },
  { name: 'Queenstown', lat: -45.0312, lon: 168.6626 }
];

// 按城市名快速查找，例如 presetCityMap['Hamilton']
export const presetCityMap = Object.fromEntries(
  presetCities.map((city) => [city.name, city])
);
