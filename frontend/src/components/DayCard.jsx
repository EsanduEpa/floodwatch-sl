import RiskBadge from "./RiskBadge";

import styles from "./DayCard.module.css";

function formatDate(dateStr) {
  const dt = new Date(`${dateStr}T00:00:00`);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(dt);
}

/**
 * One forecast day. `action` is the matched briefing action sentence, or null
 * (renders "—") when no briefing entry exists for this day.
 */
export default function DayCard({ day, action }) {
  return (
    <div className={styles.card}>
      <span className={styles.date}>{formatDate(day.date)}</span>

      <div className={styles.badge}>
        <RiskBadge riskLevel={day.risk_level} />
      </div>

      <div className={styles.metrics}>
        <span className={styles.metric}>
          Risk Score: <strong>{day.flood_risk_score.toFixed(2)}</strong>
        </span>
        <span className={styles.metric}>
          Rainfall: <strong>{day.rainfall_mm}mm</strong>
        </span>
      </div>

      <div className={styles.divider} />

      <p className={action ? styles.action : styles.actionEmpty}>
        {action || "—"}
      </p>
    </div>
  );
}
