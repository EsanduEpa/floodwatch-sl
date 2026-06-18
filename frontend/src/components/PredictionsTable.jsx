import RiskBadge from "./RiskBadge";

import styles from "./PredictionsTable.module.css";

const TZ = "Asia/Colombo";
const timeFmt = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
  timeZone: TZ,
});
const dateFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit", timeZone: TZ });

function formatTimestamp(ts) {
  const d = new Date(ts);
  return `${timeFmt.format(d)} · ${dateFmt.format(d)}`;
}

export default function PredictionsTable({ rows }) {
  if (!rows || rows.length === 0) {
    return <div className={styles.empty}>No predictions logged yet</div>;
  }

  return (
    <div className={styles.scroll}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Record ID</th>
            <th>Source</th>
            <th>Score</th>
            <th>Risk Level</th>
            <th>Model Version</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const isForecast = String(r.record_id).startsWith("forecast_");
            return (
              <tr key={r.id}>
                <td className={styles.ts}>{formatTimestamp(r.timestamp)}</td>
                <td className={styles.recId} title={r.record_id}>{r.record_id}</td>
                <td>
                  <span className={isForecast ? styles.sourceForecast : styles.sourceDirect}>
                    {isForecast ? "Forecast" : "Direct"}
                  </span>
                </td>
                <td className={styles.score}>{r.flood_risk_score.toFixed(2)}</td>
                <td>
                  <RiskBadge riskLevel={r.risk_level} />
                </td>
                <td className={styles.model}>{r.model_version}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
