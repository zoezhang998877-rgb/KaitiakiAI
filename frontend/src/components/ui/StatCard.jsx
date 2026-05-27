import RiskBadge from './RiskBadge';

/** 统计数字卡片：可显示普通文字或风险徽章 */
export default function StatCard({ label, value, risk }) {
  return (
    <div className="stat-card">
      <div className="stat-card__label">{label}</div>
      <div className="stat-card__value">
        {risk ? <RiskBadge level={risk} /> : value}
      </div>
    </div>
  );
}
