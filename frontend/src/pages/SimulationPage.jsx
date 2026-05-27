/**
 * 页面 4：情景模拟
 * 在当前搜索地点的有效降雨量基础上，用滑块模拟「降雨增加 X%」后的洪水风险
 */
import { useEffect, useState } from 'react';
import { useHazard } from '../context/HazardContext';
import PageHeader from '../components/ui/PageHeader';
import RiskBadge from '../components/ui/RiskBadge';
import StatCard from '../components/ui/StatCard';
import {
  getFloodRiskFromPrecipitation,
  getRecommendation,
  riskToScore
} from '../utils/riskLevels';
import { buildLocationMetrics } from '../utils/hazardMetrics';

export default function SimulationPage() {
  const { displayName, earthquakeData, hazardData } = useHazard();
  const [rainIncrease, setRainIncrease] = useState(0); // 滑块：降雨增加百分比

  const metrics = buildLocationMetrics(displayName, earthquakeData, hazardData);
  const hasLiveData =
    hazardData?.floodRisk && hazardData.floodRisk !== 'No data';

  // 基准降雨量 = 有效降雨（当前 + 预报综合）
  const baseline = hasLiveData
    ? hazardData.effectivePrecipitation ?? hazardData.precipitation
    : 0;

  // 切换地点时重置滑块
  useEffect(() => {
    setRainIncrease(0);
  }, [displayName]);

  // 模拟后降雨量 = 基准 × (1 + 增加百分比)
  const simulatedMm = baseline * (1 + rainIncrease / 100);
  const predictedFlood = getFloodRiskFromPrecipitation(simulatedMm);
  const simulatedOverall = predictedFlood;

  return (
    <div className="page">
      <PageHeader
        eyebrow="What-if analysis"
        title="Scenario Simulation"
        description="Model how increased rainfall could change flood risk for your active location."
      />

      {!hasLiveData ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state__icon">🌧️</div>
            <p>Search a location on the Hazard Map first to run simulations with live data.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid--4" style={{ marginBottom: 24 }}>
            <StatCard label="Location" value={displayName} />
            <StatCard label="Current flood" risk={metrics.floodRisk} />
            <StatCard label="Baseline rain" value={`${baseline.toFixed(1)} mm`} />
            <StatCard label="Earthquake" risk={metrics.earthquakeRisk} />
          </div>

          <div className="card" style={{ maxWidth: 720 }}>
            <h3 className="card__title">Rainfall increase scenario</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: 0 }}>
              Adjust the slider to simulate additional rainfall on top of the effective baseline (current + forecast).
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Increase
              </span>
              <strong style={{ color: 'var(--accent)' }}>{rainIncrease}%</strong>
            </div>

            <input
              className="slider"
              type="range"
              min="0"
              max="80"
              value={rainIncrease}
              onChange={(e) => setRainIncrease(Number(e.target.value))}
            />

            <div className="grid grid--3" style={{ marginTop: 24 }}>
              <div className="stat-card">
                <div className="stat-card__label">Simulated rain</div>
                <div className="stat-card__value">{simulatedMm.toFixed(1)} mm</div>
              </div>
              <div className="stat-card">
                <div className="stat-card__label">Predicted flood</div>
                <div className="stat-card__value">
                  <RiskBadge level={predictedFlood} />
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-card__label">Risk score</div>
                <div className="stat-card__value">{riskToScore(predictedFlood).toFixed(2)}</div>
              </div>
            </div>

            <div
              className="card card--highlight"
              style={{ marginTop: 20, padding: 18 }}
            >
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                {getRecommendation(simulatedOverall)}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
