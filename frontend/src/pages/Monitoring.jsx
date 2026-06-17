import { useState, useEffect, useCallback } from "react";

import api from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorAlert from "../components/ErrorAlert";

import styles from "./Monitoring.module.css";

export default function Monitoring() {
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [modelInfo, setModelInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  // Fetch all three endpoints in parallel; state updates happen after await.
  const fetchData = useCallback(async () => {
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
        await fetchData();
      } catch {
        if (active) setError("Could not load monitoring data. Is the API running?");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [fetchData]);

  const handleRetry = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await fetchData();
    } catch {
      setError("Could not load monitoring data. Is the API running?");
    } finally {
      setLoading(false);
    }
  }, [fetchData]);

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

      {/* Initial load */}
      {loading && (
        <div className={styles.loading}>
          <LoadingSpinner size={28} variant="dark" />
          <p className={styles.loadingText}>Loading monitoring data…</p>
        </div>
      )}

      {!loading && error && <ErrorAlert message={error} onRetry={handleRetry} />}

      {/* Dashboard (sections added in later phases) */}
      {!loading && !error && stats && (
        <div className={styles.dashboard}>
          <div className={styles.placeholder}>
            Loaded {stats.total_predictions} predictions · {history.length} history rows ·
            model {modelInfo?.model_version}. (Sections coming next.)
          </div>
        </div>
      )}
    </div>
  );
}
