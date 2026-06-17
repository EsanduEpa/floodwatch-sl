import styles from "./SummaryStats.module.css";

const LEVEL_CLASS = {
  Low: styles.low,
  Moderate: styles.moderate,
  High: styles.high,
  Critical: styles.critical,
};

function formatDay(dateStr) {
  const dt = new Date(`${dateStr}T00:00:00`);
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(dt);
}

/**
 * Four summary chips: Peak Risk, Max Score, Avg Score, and a calculated
 * Risk Trend (Rising / Falling / Stable) from the first-vs-last score delta.
 */
export default function SummaryStats({ summary, forecast }) {
  const first = forecast[0]?.flood_risk_score ?? 0;
  const last = forecast[forecast.length - 1]?.flood_risk_score ?? 0;
  const delta = last - first;

  let trend = "Stable";
  let trendClass = styles.stable;
  if (delta > 0.02) {
    trend = "Rising";
    trendClass = styles.rising;
  } else if (delta < -0.02) {
    trend = "Falling";
    trendClass = styles.falling;
  }

  const peakClass = LEVEL_CLASS[summary.max_risk_level] || styles.moderate;

  return (
    <div className={styles.chips}>
      <div className={`${styles.chip} ${peakClass}`}>
        <span className={styles.label}>Peak Risk</span>
        <span className={styles.value}>
          {summary.max_risk_level} · {formatDay(summary.peak_day)}
        </span>
      </div>

      <div className={styles.chip}>
        <span className={styles.label}>Max Score</span>
        <span className={styles.valueNeutral}>{summary.max_score.toFixed(2)}</span>
      </div>

      <div className={styles.chip}>
        <span className={styles.label}>Avg Score</span>
        <span className={styles.valueNeutral}>{summary.avg_score.toFixed(2)}</span>
      </div>

      <div className={`${styles.chip} ${trendClass}`}>
        <span className={styles.label}>Risk Trend</span>
        <span className={styles.value}>{trend}</span>
      </div>
    </div>
  );
}
