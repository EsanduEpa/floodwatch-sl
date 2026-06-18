import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

import styles from "./PredictionsOverTime.module.css";

const BLUE = "#185FA5";
const BORDER = "#E2E8F0";
const MUTED = "#64748B";
const TZ = "Asia/Colombo";

// Build the last 7 calendar days (incl. today) in Colombo time, filling gaps with 0.
function build7Days(history) {
  const keyFmt = new Intl.DateTimeFormat("en-CA", { timeZone: TZ });
  const labelFmt = new Intl.DateTimeFormat("en-US", { weekday: "short", day: "numeric", timeZone: TZ });
  const fullFmt = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: TZ });
  const now = Date.now();
  const buckets = [];
  const index = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now - i * 86400000);
    const key = keyFmt.format(d);
    const entry = { key, label: labelFmt.format(d), full: fullFmt.format(d), count: 0 };
    buckets.push(entry);
    index[key] = entry;
  }
  for (const row of history) {
    const key = keyFmt.format(new Date(row.timestamp));
    if (index[key]) index[key].count += 1;
  }
  return buckets;
}

function TimeTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div className={styles.tooltip}>
      <span className={styles.tipDate}>{d.full}</span>
      <span className={styles.tipCount}>
        {d.count} prediction{d.count === 1 ? "" : "s"}
      </span>
    </div>
  );
}

export default function PredictionsOverTime({ history }) {
  const data = build7Days(history || []);
  const total = data.reduce((sum, d) => sum + d.count, 0);

  if (total === 0) {
    return <div className={styles.empty}>No predictions in the last 7 days</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
        <CartesianGrid stroke="#F1F5F9" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 12, fill: MUTED }}
          tickLine={false}
          axisLine={{ stroke: BORDER }}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 12, fill: MUTED }}
          tickLine={false}
          axisLine={{ stroke: BORDER }}
          width={32}
        />
        <Tooltip content={<TimeTooltip />} cursor={{ stroke: BORDER }} />
        <Line
          dataKey="count"
          stroke={BLUE}
          strokeWidth={2}
          dot={{ r: 4, fill: BLUE, strokeWidth: 0 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
