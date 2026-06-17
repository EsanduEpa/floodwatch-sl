import {
  ComposedChart,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

import styles from "./ForecastChart.module.css";

// Hex equivalents of the --risk-* / --blue tokens (recharts needs literal colors).
const RISK_HEX = {
  Low: "#16A34A",
  Moderate: "#D97706",
  High: "#DC2626",
  Critical: "#991B1B",
};
const BLUE = "#185FA5";
const BORDER = "#E2E8F0";
const MUTED = "#64748B";

const RISK_LEVELS = ["Low", "Moderate", "High", "Critical"];

function toChartData(forecast) {
  return forecast.map((d) => {
    const dt = new Date(`${d.date}T00:00:00`);
    return {
      label: new Intl.DateTimeFormat("en-US", { weekday: "short", day: "numeric" }).format(dt),
      fullDate: new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }).format(dt),
      score: d.flood_risk_score,
      rainfall: d.rainfall_mm,
      risk: d.risk_level,
    };
  });
}

// Each data point's dot is colored by that day's risk level.
function RiskDot({ cx, cy, payload }) {
  if (cx == null || cy == null) return null;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={4}
      fill={RISK_HEX[payload.risk] || BLUE}
      stroke="#fff"
      strokeWidth={1.5}
    />
  );
}

function ChartTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div className={styles.tooltip}>
      <div className={styles.tipDate}>{d.fullDate}</div>
      <div className={styles.tipRow}>
        <span className={styles.tipDot} style={{ background: RISK_HEX[d.risk] }} />
        <span style={{ color: RISK_HEX[d.risk], fontWeight: 600 }}>{d.risk} band</span>
      </div>
      <div className={styles.tipRow}>Score {d.score.toFixed(2)}</div>
      <div className={styles.tipRow}>Rain {d.rainfall} mm</div>
    </div>
  );
}

export default function ForecastChart({ forecast }) {
  const data = toChartData(forecast);

  return (
    <div className={styles.wrap}>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
          <CartesianGrid stroke="#F1F5F9" vertical={false} />

          {/* Risk-band boundaries — subtle dashed reference lines */}
          {[0.3, 0.55, 0.75].map((y) => (
            <ReferenceLine
              key={y}
              yAxisId="left"
              y={y}
              stroke={BORDER}
              strokeDasharray="4 4"
              strokeWidth={0.5}
            />
          ))}

          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: MUTED }}
            tickLine={false}
            axisLine={{ stroke: BORDER }}
          />
          <YAxis
            yAxisId="left"
            domain={[0, 1]}
            ticks={[0, 0.3, 0.55, 0.75, 1]}
            tick={{ fontSize: 12, fill: MUTED }}
            tickLine={false}
            axisLine={{ stroke: BORDER }}
            width={36}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 12, fill: MUTED }}
            tickLine={false}
            axisLine={{ stroke: BORDER }}
            width={40}
            unit="mm"
          />

          <Tooltip content={<ChartTooltip />} cursor={{ stroke: BORDER }} />

          <Bar
            yAxisId="right"
            dataKey="rainfall"
            fill={BLUE}
            fillOpacity={0.16}
            barSize={18}
            radius={[3, 3, 0, 0]}
          />
          <Area
            yAxisId="left"
            dataKey="score"
            stroke="none"
            fill={BLUE}
            fillOpacity={0.08}
          />
          <Line
            yAxisId="left"
            dataKey="score"
            stroke={BLUE}
            strokeWidth={2}
            dot={<RiskDot />}
            activeDot={{ r: 5 }}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Risk-level legend */}
      <div className={styles.legend}>
        {RISK_LEVELS.map((level) => (
          <span key={level} className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: RISK_HEX[level] }} />
            {level}
          </span>
        ))}
      </div>
    </div>
  );
}
