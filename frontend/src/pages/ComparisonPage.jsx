/**
 * 页面 3：地点对比
 *
 * Location A：来自全局 Context（Hazard Map 当前搜索的地点）
 * Location B：在本页独立搜索，有自己的 state，也走实时 API
 *
 * 这样两个地点都是真实数据，不再依赖写死的 5 个城市列表
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useHazard } from '../context/HazardContext';
import PageHeader from '../components/ui/PageHeader';
import SearchBar from '../components/ui/SearchBar';
import LocationPanel from '../components/comparison/LocationPanel';
import { presetCities } from '../data/presetCities';
import {
  geocodeLocation,
  loadHazardForCoordinates
} from '../services/hazardService';
import { buildLocationMetrics } from '../utils/hazardMetrics';
import { resolveLocationLabel } from '../utils/locationUtils';
import { presetCityMap } from '../data/presetCities';
import { riskToNumber } from '../utils/riskLevels';

// Location B 数据还没加载时的默认值
const emptyEarthquake = { nearbyCount: 0, maxMagnitude: 0, status: 'No data' };
const emptyHazard = {
  floodRisk: 'No data',
  precipitation: 0,
  forecast24h: 0,
  forecast3DayTotal: 0,
  effectivePrecipitation: 0
};

export default function ComparisonPage() {
  // A 侧：读取全局主搜索地点
  const {
    displayName,
    earthquakeData,
    hazardData,
    isLoading: primaryLoading
  } = useHazard();

  // B 侧：本页自己管理的状态
  const [compareSearch, setCompareSearch] = useState('');
  const [compareDisplayName, setCompareDisplayName] = useState('');
  const [compareEarthquake, setCompareEarthquake] = useState(emptyEarthquake);
  const [compareHazard, setCompareHazard] = useState(emptyHazard);
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareError, setCompareError] = useState('');
  const compareRequestRef = useRef(0); // 防止 B 侧快速连搜时数据错乱
  const hasInitializedCompare = useRef(false);

  // 把原始 API 数据整理成可展示的指标
  const primaryMetrics = buildLocationMetrics(
    displayName,
    earthquakeData,
    hazardData
  );

  const compareMetrics =
    compareDisplayName && compareHazard.floodRisk !== 'No data'
      ? buildLocationMetrics(
          compareDisplayName,
          compareEarthquake,
          compareHazard
        )
      : null;

  // 根据经纬度加载 B 侧地点的实时数据
  const loadCompareCoordinates = useCallback(async (lat, lon, rawName) => {
    const requestId = ++compareRequestRef.current;
    const label = resolveLocationLabel(rawName, presetCityMap);

    setCompareLoading(true);
    setCompareError('');

    try {
      const results = await loadHazardForCoordinates(lat, lon);

      if (requestId !== compareRequestRef.current) return;

      setCompareDisplayName(label);
      setCompareEarthquake(results.earthquakeData);
      setCompareHazard(results.hazardData);
    } catch (error) {
      console.error(error);
      if (requestId !== compareRequestRef.current) return;
      setCompareError('Failed to load comparison location.');
    } finally {
      if (requestId === compareRequestRef.current) {
        setCompareLoading(false);
      }
    }
  }, []);

  // B 侧：用户输入地名搜索
  const searchCompareLocation = useCallback(async () => {
    if (!compareSearch.trim()) return;

    const requestId = ++compareRequestRef.current;
    setCompareLoading(true);
    setCompareError('');

    try {
      const geocoded = await geocodeLocation(compareSearch);

      if (requestId !== compareRequestRef.current) return;

      if (!geocoded) {
        setCompareError('Location not found. Try another New Zealand place name.');
        setCompareLoading(false);
        return;
      }

      await loadCompareCoordinates(
        geocoded.lat,
        geocoded.lon,
        geocoded.displayName
      );
      setCompareSearch('');
    } catch (error) {
      console.error(error);
      if (requestId !== compareRequestRef.current) return;
      setCompareError('Search failed. Please try again.');
      setCompareLoading(false);
    }
  }, [compareSearch, loadCompareCoordinates]);

  // 首次进入对比页：默认加载 Wellington 作为 B 侧
  useEffect(() => {
    if (hasInitializedCompare.current) return;
    hasInitializedCompare.current = true;
    loadCompareCoordinates(-41.2865, 174.7762, 'Wellington');
  }, [loadCompareCoordinates]);

  // 柱状图数据：A 和 B 并排对比
  const chartData = compareMetrics
    ? [
        {
          metric: 'Flood',
          primary: riskToNumber(primaryMetrics.floodRisk),
          compare: riskToNumber(compareMetrics.floodRisk)
        },
        {
          metric: 'Earthquake',
          primary: riskToNumber(primaryMetrics.earthquakeRisk),
          compare: riskToNumber(compareMetrics.earthquakeRisk)
        },
        {
          metric: 'Risk score',
          primary: Number((primaryMetrics.riskScore * 3).toFixed(2)),
          compare: Number((compareMetrics.riskScore * 3).toFixed(2))
        },
        {
          metric: 'Rain (mm)',
          primary: Number(primaryMetrics.precipitation.toFixed(1)),
          compare: Number(compareMetrics.precipitation.toFixed(1))
        }
      ]
    : [];

  // 风险分数更低的地点算「相对更安全」
  const saferLocation =
    compareMetrics &&
    (primaryMetrics.riskScore < compareMetrics.riskScore
      ? primaryMetrics.displayName
      : primaryMetrics.riskScore > compareMetrics.riskScore
      ? compareMetrics.displayName
      : 'Both locations show similar risk');

  return (
    <div className="page">
      <PageHeader
        eyebrow="Side-by-side analysis"
        title="Location Comparison"
        description="Compare your active Hazard Map location against any other New Zealand place — both sides use live API data."
      />

      {/* B 侧搜索区 */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 className="card__title">Compare with another location</h3>
        <SearchBar
          value={compareSearch}
          onChange={setCompareSearch}
          onSubmit={searchCompareLocation}
          placeholder="Search second location (e.g. Christchurch, Rotorua)..."
          buttonLabel="Load comparison"
          loading={compareLoading}
        />
        <div className="chip-group" style={{ marginTop: 14 }}>
          {presetCities.map((city) => (
            <button
              key={city.name}
              type="button"
              className={`chip${compareDisplayName === city.name ? ' chip--active' : ''}`}
              onClick={() =>
                loadCompareCoordinates(city.lat, city.lon, city.name)
              }
              disabled={compareLoading}
            >
              {city.name}
            </button>
          ))}
        </div>
        {compareError && (
          <p style={{ color: 'var(--high)', fontSize: '0.875rem', marginTop: 12 }}>
            {compareError}
          </p>
        )}
      </div>

      {/* 左右对比面板 */}
      <div className="comparison-layout">
        <LocationPanel
          title="Location A"
          subtitle="From Hazard Map (primary)"
          metrics={primaryMetrics}
          loading={primaryLoading && primaryMetrics.floodRisk === 'No data'}
          highlight
        />
        <div className="comparison-vs">VS</div>
        <LocationPanel
          title="Location B"
          subtitle="Comparison target (live search)"
          metrics={compareMetrics}
          loading={compareLoading}
        />
      </div>

      {compareMetrics && (
        <>
          <div
            className="card card--highlight"
            style={{ marginTop: 24, textAlign: 'center' }}
          >
            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Lower composite risk score
            </span>
            <p style={{ margin: '8px 0 0', fontSize: '1.25rem', fontWeight: 600 }}>
              {saferLocation}
            </p>
          </div>

          <div className="chart-card" style={{ marginTop: 24 }}>
            <h3>Comparison chart</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="metric" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    background: '#111d33',
                    border: '1px solid var(--border)',
                    borderRadius: 8
                  }}
                />
                <Legend />
                <Bar
                  name={primaryMetrics.displayName}
                  dataKey="primary"
                  fill="#2dd4bf"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  name={compareMetrics.displayName}
                  dataKey="compare"
                  fill="#60a5fa"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      <p className="footer-note">
        Location A updates when you search on the Hazard Map. Location B is loaded independently via search or quick-select — all metrics come from GeoNet and Open-Meteo.
      </p>
    </div>
  );
}
