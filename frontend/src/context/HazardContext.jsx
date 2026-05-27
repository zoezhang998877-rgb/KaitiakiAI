/**
 * 全局「灾害数据」上下文
 * 作用：把地图搜索到的地点、地震、降雨数据存在一个地方，
 *       所有页面（Dashboard、Simulation、Compare 的 A 侧）都能读取
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react';
import {
  geocodeLocation,
  loadHazardForCoordinates
} from '../services/hazardService';
import { presetCityMap } from '../data/presetCities';
import { resolveLocationLabel } from '../utils/locationUtils';

// 默认城市：Hamilton（应用第一次打开时自动加载）
const DEFAULT_POSITION = [-37.787, 175.279];
const DEFAULT_LOCATION = 'Hamilton';

// 数据还没加载完成时的默认值
const emptyEarthquake = {
  nearbyCount: 0,
  maxMagnitude: 0,
  status: 'No data'
};

const emptyHazard = {
  floodRisk: 'No data',
  precipitation: 0,
  forecast24h: 0,
  forecast3DayTotal: 0,
  effectivePrecipitation: 0
};

const HazardContext = createContext(null);

export function HazardProvider({ children }) {
  // ---------- 全局状态 ----------
  const [location, setLocation] = useState(DEFAULT_LOCATION);       // 标准化后的地名
  const [displayName, setDisplayName] = useState(DEFAULT_LOCATION); // 页面上显示的名字
  const [position, setPosition] = useState(DEFAULT_POSITION);       // 地图坐标 [纬度, 经度]
  const [earthquakeData, setEarthquakeData] = useState(emptyEarthquake);
  const [hazardData, setHazardData] = useState(emptyHazard);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');

  // requestIdRef：防止用户快速连点搜索时，旧请求的结果覆盖新结果
  const requestIdRef = useRef(0);
  const hasLoadedRef = useRef(false);

  // 把 API 返回的结果写入全局状态
  const applyHazardResults = useCallback((label, coords, results) => {
    setLocation(label);
    setDisplayName(label);
    setPosition(coords);
    setEarthquakeData(results.earthquakeData);
    setHazardData(results.hazardData);
  }, []);

  // 已知经纬度时直接加载（快捷城市、默认城市用这个）
  const loadCoordinates = useCallback(async (lat, lon, rawName) => {
    const requestId = ++requestIdRef.current;
    const label = resolveLocationLabel(rawName, presetCityMap);

    setIsLoading(true);
    setLoadError('');

    try {
      const results = await loadHazardForCoordinates(lat, lon);

      // 如果已经有更新的请求在进行，丢弃这次结果
      if (requestId !== requestIdRef.current) return;

      applyHazardResults(label, [lat, lon], results);
    } catch (error) {
      console.error(error);
      if (requestId !== requestIdRef.current) return;
      setLoadError('Unable to load hazard data. Please try again.');
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [applyHazardResults]);

  // 用户输入地名搜索：先地理编码，再拉取灾害数据
  const searchLocation = useCallback(async (query) => {
    if (!query?.trim()) return false;

    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setLoadError('');

    try {
      const geocoded = await geocodeLocation(query);

      if (requestId !== requestIdRef.current) return false;

      if (!geocoded) {
        setLoadError('Location not found. Try another New Zealand place name.');
        setIsLoading(false);
        return false;
      }

      const label = resolveLocationLabel(geocoded.displayName, presetCityMap);
      const results = await loadHazardForCoordinates(geocoded.lat, geocoded.lon);

      if (requestId !== requestIdRef.current) return false;

      applyHazardResults(label, [geocoded.lat, geocoded.lon], results);
      return true;
    } catch (error) {
      console.error(error);
      if (requestId !== requestIdRef.current) return false;
      setLoadError('Search failed. Check your connection and try again.');
      return false;
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [applyHazardResults]);

  // 点击快捷城市芯片时调用
  const loadPresetCity = useCallback(
    (cityName) => {
      const preset = presetCityMap[cityName];
      if (!preset) return Promise.resolve(false);
      return loadCoordinates(preset.lat, preset.lon, preset.name);
    },
    [loadCoordinates]
  );

  // 应用首次打开：自动加载 Hamilton 数据
  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    const [lat, lon] = DEFAULT_POSITION;
    loadCoordinates(lat, lon, DEFAULT_LOCATION);
  }, [loadCoordinates]);

  const value = {
    location,
    displayName,
    position,
    earthquakeData,
    hazardData,
    isLoading,
    loadError,
    setLoadError,
    searchLocation,
    loadCoordinates,
    loadPresetCity
  };

  return (
    <HazardContext.Provider value={value}>{children}</HazardContext.Provider>
  );
}

// 各页面用这个 Hook 读取全局数据，例如：const { displayName } = useHazard();
export function useHazard() {
  const context = useContext(HazardContext);
  if (!context) {
    throw new Error('useHazard must be used within HazardProvider');
  }
  return context;
}
