import { useState, useEffect, useCallback } from "react";
import {
  Activity,
  Gauge,
  TrendingUp,
  AlertCircle,
  PieChart as PieIcon,
  LineChart as LineIcon,
  ListChecks,
  FlaskConical,
  Info,
} from "lucide-react";

import api from "../services/api";
import StatCard from "../components/StatCard";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorAlert from "../components/ErrorAlert";
import RiskDistributionPie from "../components/RiskDistributionPie";
import PredictionsOverTime from "../components/PredictionsOverTime";
import PredictionsTable from "../components/PredictionsTable";
import MLflowGallery from "../components/MLflowGallery";
import { readRiskColors } from "../components/riskColors";

import styles from "./Monitoring.module.css";

const MLFLOW_SHOTS = [
  { src: "/mlflow/mlflow_01_seed_comparison.png", caption: "5-seed parallel coordinates" },
  { src: "/mlflow/mlflow_02_experiments_overview.png", caption: "All experiments" },
  { src: "/mlflow/mlflow_03_v010_vs_v014.png", caption: "V010 single vs V014 ensemble" },
  { src: "/mlflow/mlflow_04_champion_detail.png", caption: "Production champion record" },
];

// Descending severity so ties resolve to the higher-severity level.
const SEVERITY_DESC = ["Critical", "High", "Moderate", "Low"];

function mostCommonLevel(breakdown) {
  let level = null;
  let max = -1;
  for (const lvl of SEVERITY_DESC) {
    const c = breakdown?.[lvl] ?? 0;
    if (c > max) {
      max = c;
      level = lvl;
    }
  }
  return level;
}

export default function Monitoring() {
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [modelInfo, setModelInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshError, setRefreshError] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const fetchAll = useCallback(async () => {
    const [statsRes, historyRes, modelRes] = await Promise.all([
      api.get("/stats"),
      api.get("/history?limit=500"),
      api.get("/model-info"),
    ]);
    setStats(statsRes.data);
    setHistory(historyRes.data || []);
    setModelInfo(modelRes.data);
    setLastRefreshed(new Date());
  }, []);

  // Initial load.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        await fetchAll();
      } catch {
        if (active) setError("Could not load monitoring data. Is the API running?");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [fetchAll]);

  // Auto-refresh stats + history every 30s (model-info is static).
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const [statsRes, historyRes] = await Promise.all([
          api.get("/stats"),
          api.get("/history?limit=500"),
        ]);
        setStats(statsRes.data);
        setHistory(historyRes.data || []);
        setLastRefreshed(new Date());
        setRefreshError(false);
      } catch {
        setRefreshError(true);
      }
    }, 30000);
    return () => clearInterval(id);
  }, []);

  const handleRetry = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await fetchAll();
    } catch {
      setError("Could not load monitoring data. Is the API running?");
    } finally {
      setLoading(false);
    }
  }, [fetchAll]);

  const lastRefreshedText = lastRefreshed
    ? new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }).format(lastRefreshed)
    : "—";

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>System Monitoring</h1>
          <p className={styles.subtitle}>
            Real-time operational telemetry for the FloodWatch SL flood risk prediction service
          </p>
        </div>
        <div className={styles.headerMeta}>
          <span className={styles.autoRefresh}>
            <span className={styles.greenDot} />
            Auto-refresh: every 30s
          </span>
          <span className={styles.lastRefreshed}>Last refreshed: {lastRefreshedText}</span>
        </div>
      </header>

      {loading && (
        <div className={styles.loading}>
          <LoadingSpinner size={28} variant="dark" />
          <p className={styles.loadingText}>Loading monitoring data…</p>
        </div>
      )}

      {!loading && error && <ErrorAlert message={error} onRetry={handleRetry} />}

      {!loading && !error && stats && (() => {
        const colors = readRiskColors();
        const total = stats.total_predictions ?? 0;
        const most = total > 0 ? mostCommonLevel(stats.risk_breakdown) : null;
        const recent = history.slice(0, 20);

        return (
          <div className={styles.dashboard}>
            {refreshError && (
              <div className={styles.refreshWarning}>
                Refresh failed — showing last known data
              </div>
            )}

            {/* Section 1 — Stat strip */}
            <div className={styles.statStrip}>
              <StatCard icon={Activity} label="Total Predictions Made" value={total.toLocaleString()} />
              <StatCard icon={Gauge} label="Average Risk Score" value={(stats.avg_score ?? 0).toFixed(3)} />
              <StatCard icon={TrendingUp} label="Highest Score Recorded" value={(stats.max_score ?? 0).toFixed(4)} />
              <StatCard
                icon={AlertCircle}
                label="Most Common Risk Level"
                value={most || "—"}
                valueColor={most ? colors[most] : undefined}
              />
            </div>

            {/* Section 2 — Charts */}
            <div className={styles.chartsRow}>
              <section className={styles.card}>
                <h2 className={styles.cardHeader}>
                  <PieIcon size={18} strokeWidth={2.2} />
                  Risk Level Distribution
                </h2>
                <RiskDistributionPie riskBreakdown={stats.risk_breakdown} />
              </section>

              <section className={styles.card}>
                <h2 className={styles.cardHeader}>
                  <LineIcon size={18} strokeWidth={2.2} />
                  Predictions Over Time
                </h2>
                <p className={styles.cardSub}>Last 7 days, grouped by day</p>
                <PredictionsOverTime history={history} />
              </section>
            </div>

            {/* Section 3 — Recent Predictions */}
            <section className={styles.card}>
              <div className={styles.cardHeaderRow}>
                <h2 className={styles.cardHeader}>
                  <ListChecks size={18} strokeWidth={2.2} />
                  Recent Predictions
                </h2>
                <span className={styles.showing}>
                  Showing latest {recent.length} of {total.toLocaleString()} total
                </span>
              </div>
              <PredictionsTable rows={recent} />
            </section>

            {/* Section 4 — Experiment Tracking */}
            <section className={styles.card}>
              <h2 className={styles.cardHeader}>
                <FlaskConical size={18} strokeWidth={2.2} />
                Experiment Tracking — MLflow
              </h2>
              <p className={styles.cardSub}>
                Every model training experiment is tracked with MLflow. Below are screenshots from our
                experiment tracking system showing the 5-seed ensemble validation, model approach
                comparison, and production champion record.
              </p>
              <MLflowGallery items={MLFLOW_SHOTS} />
            </section>

            {/* Section 5 — Model Information */}
            <section className={styles.modelCard}>
              <h2 className={styles.modelHeader}>
                <Info size={18} strokeWidth={2.2} />
                Model Information
              </h2>
              <div className={styles.modelGrid}>
                <span className={styles.mLabel}>Model Name</span>
                <span className={styles.mValue}>{modelInfo?.model_name}</span>
                <span className={styles.mLabel}>Model Version</span>
                <span className={styles.mValue}>{modelInfo?.model_version}</span>
                <span className={styles.mLabel}>Models in Ensemble</span>
                <span className={styles.mValue}>{modelInfo?.number_of_models}</span>
                <span className={styles.mLabel}>Feature Count</span>
                <span className={styles.mValue}>{modelInfo?.feature_count}</span>
                <span className={styles.mLabel}>Validation Method</span>
                <span className={styles.mValue}>{modelInfo?.validation_method}</span>
                <span className={styles.mLabel}>API Status</span>
                <span className={styles.mValue}>
                  <span className={styles.statusDot} />
                  Operational
                </span>
              </div>
            </section>
          </div>
        );
      })()}
    </div>
  );
}
