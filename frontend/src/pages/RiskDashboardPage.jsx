/**
 * 页面 2：风险仪表盘
 * 读取全局 Context 的数据，用图表展示当前搜索地点的风险指标
 */
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { useHazard } from '../context/HazardContext';
import PageHeader from '../components/ui/PageHeader';
import StatCard from '../components/ui/StatCard';
import { buildLocationMetrics } from '../utils/hazardMetrics';
import { riskToNumber } from '../utils/riskLevels';

const RISK_COLORS = {
  3: '#f87171',
  2: '#fbbf24',
  1: '#4ade80',
  0: '#64748b'
};

export default function RiskDashboardPage() {
  const { displayName, earthquakeData, hazardData } = useHazard();
  const metrics = buildLocationMetrics(displayName, earthquakeData, hazardData);

  // 三张图各自用合适的数据，避免不同单位混在一张图里
  const riskChartData = [
    { name: 'Flood', value: riskToNumber(metrics.floodRisk) },
    { name: 'Earthquake', value: riskToNumber(metrics.earthquakeRisk) }
  ];

  const weatherChartData = [
    { name: 'Current', value: metrics.precipitation },
    { name: '24h', value: metrics.forecast24h },
    { name: '3-day', value: metrics.forecast3DayTotal }
  ];

  const quakeChartData = [
    { name: 'Nearby', value: metrics.nearbyCount },
    { name: 'Max Mag.', value: Number(metrics.maxMagnitude.toFixed(1)) }
  ];

  return (
    <div className="page">
      <PageHeader
        eyebrow="Analytics"
        title="Risk Dashboard"
        description={`Live hazard analytics for ${displayName}. Metrics refresh when you search on the Hazard Map.`}
      />

      <div className="grid grid--4" style={{ marginBottom: 24 }}>
        <StatCard label="Overall" risk={metrics.overallRisk} />
        <StatCard label="Flood" risk={metrics.floodRisk} />
        <StatCard label="Earthquake" risk={metrics.earthquakeRisk} />
        <StatCard label="Risk score" value={metrics.riskScore.toFixed(2)} />
      </div>

      <div className="grid grid--2">
        <ChartCard title="Risk levels (1–3 scale)">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={riskChartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 3]} ticks={[0, 1, 2, 3]} />
              <Tooltip
                contentStyle={{
                  background: '#111d33',
                  border: '1px solid var(--border)',
                  borderRadius: 8
                }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {riskChartData.map((entry) => (
                  <Cell key={entry.name} fill={RISK_COLORS[entry.value] ?? RISK_COLORS[0]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Precipitation (mm)">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={weatherChartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  background: '#111d33',
                  border: '1px solid var(--border)',
                  borderRadius: 8
                }}
              />
              <Bar dataKey="value" fill="#2dd4bf" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Earthquake activity">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={quakeChartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  background: '#111d33',
                  border: '1px solid var(--border)',
                  borderRadius: 8
                }}
              />
              <Bar dataKey="value" fill="#60a5fa" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="card">
          <h3 className="card__title">Key indicators</h3>
          <div className="metric-row">
            <span className="metric-row__label">Effective rainfall</span>
            <span>{metrics.effectivePrecipitation.toFixed(1)} mm</span>
          </div>
          <div className="metric-row">
            <span className="metric-row__label">Nearby earthquakes</span>
            <span>{metrics.nearbyCount}</span>
          </div>
          <div className="metric-row">
            <span className="metric-row__label">Max magnitude</span>
            <span>{Number(metrics.maxMagnitude).toFixed(1)}</span>
          </div>
          <div className="metric-row">
            <span className="metric-row__label">Composite level</span>
            <span>{metrics.riskLevel}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="chart-card">
      <h3>{title}</h3>
      {children}
    </div>
  );
}
