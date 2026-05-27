/**
 * 页面 1：灾害地图
 * - 搜索地点
 * - 显示地图和风险摘要
 * - 搜索后会更新全局 Context，其他页面同步变化
 */
import { useState } from 'react';
import { useHazard } from '../context/HazardContext';
import PageHeader from '../components/ui/PageHeader';
import SearchBar from '../components/ui/SearchBar';
import StatCard from '../components/ui/StatCard';
import HazardMap from '../components/map/HazardMap';
import { presetCities } from '../data/presetCities';
import { getOverallRisk, getRecommendation } from '../utils/riskLevels';

export default function HazardMapPage() {
  const {
    displayName,
    position,
    earthquakeData,
    hazardData,
    isLoading,
    searchLocation,
    loadPresetCity
  } = useHazard();

  const [search, setSearch] = useState(''); // 搜索框输入内容（仅本页使用）

  const floodRisk = hazardData?.floodRisk ?? 'No data';
  const overallRisk = getOverallRisk(earthquakeData.status, floodRisk);

  async function handleSearch() {
    if (!search.trim()) return;
    const ok = await searchLocation(search);
    if (ok) setSearch(''); // 搜索成功后清空输入框
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow="Live monitoring"
        title="Hazard Map"
        description="Search any New Zealand location to view real-time earthquake activity, rainfall, and composite risk assessment."
      />

      {/* 搜索区 + 快捷城市 */}
      <div className="card" style={{ marginBottom: 24 }}>
        <SearchBar
          value={search}
          onChange={setSearch}
          onSubmit={handleSearch}
          loading={isLoading}
        />
        <div className="chip-group" style={{ marginTop: 14 }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginRight: 4 }}>
            Quick select:
          </span>
          {presetCities.map((city) => (
            <button
              key={city.name}
              type="button"
              className={`chip${displayName === city.name ? ' chip--active' : ''}`}
              onClick={() => loadPresetCity(city.name)}
              disabled={isLoading}
            >
              {city.name}
            </button>
          ))}
        </div>
      </div>

      <HazardMap position={position} displayName={displayName} />

      {/* 四个关键指标卡片 */}
      <div className="grid grid--4" style={{ marginTop: 24 }}>
        <StatCard label="Overall risk" risk={overallRisk} />
        <StatCard label="Flood risk" risk={floodRisk} />
        <StatCard label="Earthquake" risk={earthquakeData.status} />
        <StatCard
          label="Nearby quakes"
          value={earthquakeData.nearbyCount}
        />
      </div>

      <div className="grid grid--2" style={{ marginTop: 20 }}>
        <div className="card">
          <h3 className="card__title">Risk summary</h3>
          <div className="metric-row">
            <span className="metric-row__label">Location</span>
            <span>{displayName}</span>
          </div>
          <div className="metric-row">
            <span className="metric-row__label">Current precipitation</span>
            <span>{hazardData.precipitation} mm</span>
          </div>
          <div className="metric-row">
            <span className="metric-row__label">24h forecast</span>
            <span>{hazardData.forecast24h} mm</span>
          </div>
          <div className="metric-row">
            <span className="metric-row__label">3-day forecast total</span>
            <span>{hazardData.forecast3DayTotal} mm</span>
          </div>
          <div className="metric-row">
            <span className="metric-row__label">Max magnitude</span>
            <span>{Number(earthquakeData.maxMagnitude).toFixed(1)}</span>
          </div>
        </div>

        <div className="card card--highlight">
          <h3 className="card__title">Recommendation</h3>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
            {getRecommendation(overallRisk)}
          </p>
          {overallRisk === 'High' && (
            <p style={{ marginTop: 16, color: 'var(--high)', fontWeight: 600 }}>
              ⚠ High risk alert — monitor official warnings.
            </p>
          )}
        </div>
      </div>

      <p className="footer-note">
        Data sources: GeoNet (earthquakes within 100 km) · Open-Meteo (current + forecast rainfall).
        Updated on each search.
      </p>
    </div>
  );
}
