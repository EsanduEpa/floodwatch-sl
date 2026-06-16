import styles from "./RiskBadge.module.css";

const LEVEL_CLASS = {
  Low: styles.low,
  Moderate: styles.moderate,
  High: styles.high,
  Critical: styles.critical,
};

export default function RiskBadge({ riskLevel }) {
  const levelClass = LEVEL_CLASS[riskLevel] || styles.moderate;

  return (
    <span className={`${styles.badge} ${levelClass}`}>
      <span className={styles.dot} />
      {riskLevel || "Unknown"}
    </span>
  );
}
