import { badgeClassForRisk } from '../../utils/riskLevels';

/** 风险等级彩色徽章（High / Medium / Low） */
export default function RiskBadge({ level }) {
  return <span className={`badge ${badgeClassForRisk(level)}`}>{level}</span>;
}
