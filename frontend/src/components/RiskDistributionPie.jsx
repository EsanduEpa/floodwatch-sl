import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

import { readRiskColors } from "./riskColors";
import styles from "./RiskDistributionPie.module.css";

const LEVELS = ["Low", "Moderate", "High", "Critical"];

function PieTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const p = payload[0];
  const pct = (p.percent != null ? p.percent * 100 : 0).toFixed(1);
  return (
    <div className={styles.tooltip}>
      <span className={styles.tipName} style={{ color: p.payload.color }}>{p.name}</span>
      <span className={styles.tipVal}>{p.value} · {pct}%</span>
    </div>
  );
}

export default function RiskDistributionPie({ riskBreakdown }) {
  const colors = readRiskColors();
  const data = LEVELS.map((name) => ({
    name,
    value: riskBreakdown?.[name] ?? 0,
    color: colors[name],
  }));
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    return <div className={styles.empty}>No predictions logged yet</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={2}
        >
          {data.map((d) => (
            <Cell key={d.name} fill={d.color} stroke="#fff" strokeWidth={2} />
          ))}
        </Pie>
        <Tooltip content={<PieTooltip />} />
        <Legend
          verticalAlign="bottom"
          height={36}
          formatter={(value, entry) => `${value} (${entry.payload.value})`}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
