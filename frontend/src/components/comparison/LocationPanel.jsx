/**
 * 对比页单侧地点面板：展示一个地点的各项风险指标
 */
import RiskBadge from '../ui/RiskBadge';
import { badgeClassForRisk } from '../../utils/riskLevels';

export default function LocationPanel({
  title,       // 例如 "Location A"
  subtitle,    // 说明文字
  metrics,     // buildLocationMetrics() 返回的对象
  loading,
  highlight    // 是否高亮边框（主搜索地点）
}) {
  if (loading) {
    return (
      <div className={`card${highlight ? ' card--highlight' : ''}`}>
        <h3 className="card__title">{title}</h3>
        <p style={{ color: 'var(--text-muted)' }}>Loading live data...</p>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className={`card${highlight ? ' card--highlight' : ''}`}>
        <h3 className="card__title">{title}</h3>
        <div className="empty-state" style={{ padding: '24px 0' }}>
          <div className="empty-state__icon">📍</div>
          <p>{subtitle || 'Search a location to compare live hazard data.'}</p>
        </div>
      </div>
    );
  }

  const rows = [
    ['Flood risk', <RiskBadge level={metrics.floodRisk} />],
    ['Earthquake activity', <RiskBadge level={metrics.earthquakeRisk} />],
    ['Overall risk', <RiskBadge level={metrics.overallRisk} />],
    ['Risk score', metrics.riskScore.toFixed(2)],
    ['Current rain', `${metrics.precipitation.toFixed(1)} mm`],
    ['24h forecast', `${metrics.forecast24h.toFixed(1)} mm`],
    ['Nearby quakes', metrics.nearbyCount],
    ['Max magnitude', Number(metrics.maxMagnitude).toFixed(1)]
  ];

  return (
    <div className={`card${highlight ? ' card--highlight' : ''}`}>
      <div style={{ marginBottom: 16 }}>
        <h3 className="card__title" style={{ marginBottom: 4 }}>
          {title}
        </h3>
        <p style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>
          {metrics.displayName}
        </p>
        {subtitle && (
          <p style={{ margin: '6px 0 0', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            {subtitle}
          </p>
        )}
      </div>

      <div
        style={{
          marginBottom: 16,
          padding: '10px 14px',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)'
        }}
      >
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Composite level
        </span>
        <div style={{ marginTop: 6 }}>
          <span className={`badge ${badgeClassForRisk(metrics.riskLevel)}`}>
            {metrics.riskLevel}
          </span>
        </div>
      </div>

      {rows.map(([label, value]) => (
        <div className="metric-row" key={label}>
          <span className="metric-row__label">{label}</span>
          <span>{value}</span>
        </div>
      ))}
    </div>
  );
}
