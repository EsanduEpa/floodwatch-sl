import { useState } from "react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function Monitoring() {
  // =========================
  // Dummy Data
  // =========================
  const modelStats = {
    totalPredictions: 1247,
    averageRiskScore: 0.52,
    modelVersion: "v014_seed_ensemble",
    modelsInEnsemble: 25,
    lastUpdate: "2025-06-14 14:30",
    successRate: 98.5,
    failedPredictions: 19,
    apiResponseTime: 245,
  };

  const riskDistribution = [
    { name: "Low", value: 450, fill: "#28a745" },
    { name: "Moderate", value: 380, fill: "#ffc107" },
    { name: "High", value: 280, fill: "#fd7e14" },
    { name: "Critical", value: 137, fill: "#dc3545" },
  ];

  const predictionTimeline = [
    { time: "14:45", district: "Colombo", score: 0.72, level: "High", status: "Success" },
    { time: "14:42", district: "Kandy", score: 0.38, level: "Moderate", status: "Success" },
    { time: "14:39", district: "Galle", score: 0.85, level: "Critical", status: "Success" },
    { time: "14:36", district: "Matara", score: 0.25, level: "Low", status: "Success" },
    { time: "14:33", district: "Jaffna", score: 0.68, level: "High", status: "Success" },
    { time: "14:30", district: "Trincomalee", score: 0.45, level: "Moderate", status: "Success" },
    { time: "14:27", district: "Batticaloa", score: 0.92, level: "Critical", status: "Failed" },
    { time: "14:24", district: "Vavuniya", score: 0.31, level: "Low", status: "Success" },
    { time: "14:21", district: "Mullaitivu", score: 0.55, level: "Moderate", status: "Success" },
    { time: "14:18", district: "Mannar", score: 0.78, level: "High", status: "Success" },
  ];

  const riskAlertsData = [
    { id: 1, district: "Colombo", score: 0.92, level: "Critical", time: "2 min ago", coords: "6.9271, 80.7789" },
    { id: 2, district: "Galle", score: 0.85, level: "Critical", time: "5 min ago", coords: "6.0535, 80.1684" },
    { id: 3, district: "Kandy", score: 0.76, level: "High", time: "12 min ago", coords: "6.9271, 80.6366" },
    { id: 4, district: "Ratnapura", score: 0.72, level: "High", time: "18 min ago", coords: "6.6828, 80.3945" },
  ];

  const timeSeriesData = [
    { time: "08:00", score: 0.48 },
    { time: "09:00", score: 0.52 },
    { time: "10:00", score: 0.54 },
    { time: "11:00", score: 0.51 },
    { time: "12:00", score: 0.58 },
    { time: "13:00", score: 0.62 },
    { time: "14:00", score: 0.61 },
    { time: "15:00", score: 0.59 },
  ];

  const districtData = [
    { district: "Colombo", predictions: 285, avgScore: 0.68 },
    { district: "Kandy", predictions: 156, avgScore: 0.54 },
    { district: "Galle", predictions: 142, avgScore: 0.72 },
    { district: "Matara", predictions: 98, avgScore: 0.38 },
    { district: "Jaffna", predictions: 87, avgScore: 0.55 },
    { district: "Ratnapura", predictions: 76, avgScore: 0.62 },
  ];

  // =========================
  // Helper Functions
  // =========================
  const getRiskColor = (level) => {
    switch (level) {
      case "Low":
        return "#28a745";
      case "Moderate":
        return "#ffc107";
      case "High":
        return "#fd7e14";
      case "Critical":
        return "#dc3545";
      default:
        return "#6c757d";
    }
  };

  const getStatusColor = (status) => {
    return status === "Success" ? "#28a745" : "#dc3545";
  };

  const handleExportReport = () => {
    const report = `
FLOODWATCH SL - MONITORING REPORT
Generated: ${new Date().toLocaleString()}

MODEL STATISTICS
================
Total Predictions: ${modelStats.totalPredictions}
Average Risk Score: ${modelStats.averageRiskScore}
Success Rate: ${modelStats.successRate}%
Failed Predictions: ${modelStats.failedPredictions}
API Response Time: ${modelStats.apiResponseTime}ms

RISK DISTRIBUTION
=================
${riskDistribution.map(r => `${r.name}: ${r.value} predictions`).join('\n')}

MODEL INFO
==========
Model Version: ${modelStats.modelVersion}
Ensemble Models: ${modelStats.modelsInEnsemble}
Last Update: ${modelStats.lastUpdate}
    `;
    
    const element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(report));
    element.setAttribute("download", `monitoring_report_${new Date().toISOString().split('T')[0]}.txt`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // =========================
  // UI
  // =========================
  return (
    <div style={{ padding: "30px", fontFamily: "Arial, sans-serif", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <h1 style={{ textAlign: "center", color: "#333", marginBottom: "10px" }}>📊 Monitoring Dashboard</h1>
      <p style={{ textAlign: "center", color: "#666", marginBottom: "30px" }}>Real-time flood prediction metrics and system health</p>

      {/* Top Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", marginBottom: "30px" }}>
        
        <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
          <p style={{ margin: "0", color: "#666", fontSize: "12px", textTransform: "uppercase" }}>Total Predictions</p>
          <h3 style={{ margin: "10px 0 0 0", color: "#007bff", fontSize: "32px" }}>{modelStats.totalPredictions}</h3>
        </div>

        <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
          <p style={{ margin: "0", color: "#666", fontSize: "12px", textTransform: "uppercase" }}>Avg Risk Score</p>
          <h3 style={{ margin: "10px 0 0 0", color: "#fd7e14", fontSize: "32px" }}>{modelStats.averageRiskScore.toFixed(2)}</h3>
        </div>

        <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
          <p style={{ margin: "0", color: "#666", fontSize: "12px", textTransform: "uppercase" }}>Success Rate</p>
          <h3 style={{ margin: "10px 0 0 0", color: "#28a745", fontSize: "32px" }}>{modelStats.successRate}%</h3>
        </div>

        <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
          <p style={{ margin: "0", color: "#666", fontSize: "12px", textTransform: "uppercase" }}>API Response</p>
          <h3 style={{ margin: "10px 0 0 0", color: "#17a2b8", fontSize: "32px" }}>{modelStats.apiResponseTime}ms</h3>
        </div>
      </div>

      {/* Model Info */}
      <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px", marginBottom: "30px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
        <h3 style={{ marginTop: "0", color: "#0056b3", borderBottom: "2px solid #0056b3", paddingBottom: "10px" }}>⚙️ Model Information</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "15px" }}>
          <div>
            <p style={{ margin: "0", color: "#666", fontSize: "12px" }}>Model Version</p>
            <p style={{ margin: "5px 0 0 0", fontWeight: "bold", fontSize: "16px" }}>{modelStats.modelVersion}</p>
          </div>
          <div>
            <p style={{ margin: "0", color: "#666", fontSize: "12px" }}>Ensemble Size</p>
            <p style={{ margin: "5px 0 0 0", fontWeight: "bold", fontSize: "16px" }}>{modelStats.modelsInEnsemble} Models</p>
          </div>
          <div>
            <p style={{ margin: "0", color: "#666", fontSize: "12px" }}>Last Updated</p>
            <p style={{ margin: "5px 0 0 0", fontWeight: "bold", fontSize: "16px" }}>{modelStats.lastUpdate}</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "30px", marginBottom: "30px" }}>
        
        {/* Risk Distribution Pie Chart */}
        <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
          <h3 style={{ marginTop: "0", color: "#0056b3", borderBottom: "2px solid #0056b3", paddingBottom: "10px" }}>Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={riskDistribution} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={100} fill="#8884d8" dataKey="value">
                {riskDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Time Series Chart */}
        <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
          <h3 style={{ marginTop: "0", color: "#0056b3", borderBottom: "2px solid #0056b3", paddingBottom: "10px" }}>Average Risk Score Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis domain={[0, 1]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="score" stroke="#fd7e14" strokeWidth={2} name="Risk Score" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* District Analytics */}
      <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px", marginBottom: "30px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
        <h3 style={{ marginTop: "0", color: "#0056b3", borderBottom: "2px solid #0056b3", paddingBottom: "10px" }}>📍 Predictions by District</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={districtData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="district" />
            <YAxis yAxisId="left" label={{ value: "Predictions", angle: -90, position: "insideLeft" }} />
            <YAxis yAxisId="right" orientation="right" domain={[0, 1]} label={{ value: "Avg Risk Score", angle: 90, position: "insideRight" }} />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="predictions" fill="#007bff" name="Predictions" />
            <Bar yAxisId="right" dataKey="avgScore" fill="#fd7e14" name="Avg Risk Score" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Risk Alerts */}
      <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px", marginBottom: "30px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
        <h3 style={{ marginTop: "0", color: "#dc3545", borderBottom: "2px solid #dc3545", paddingBottom: "10px" }}>⚠️ High Risk Alerts</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f5f5f5", borderBottom: "2px solid #ddd" }}>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold", color: "#333" }}>District</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold", color: "#333" }}>Risk Score</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold", color: "#333" }}>Risk Level</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold", color: "#333" }}>Coordinates</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold", color: "#333" }}>Time</th>
              </tr>
            </thead>
            <tbody>
              {riskAlertsData.map((alert, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "12px" }}>{alert.district}</td>
                  <td style={{ padding: "12px", fontWeight: "bold", color: getRiskColor(alert.level) }}>{alert.score.toFixed(2)}</td>
                  <td style={{ padding: "12px" }}>
                    <span style={{ backgroundColor: getRiskColor(alert.level), color: "white", padding: "4px 8px", borderRadius: "4px", fontSize: "12px" }}>
                      {alert.level}
                    </span>
                  </td>
                  <td style={{ padding: "12px", fontSize: "12px", color: "#666" }}>{alert.coords}</td>
                  <td style={{ padding: "12px", fontSize: "12px" }}>{alert.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Predictions */}
      <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px", marginBottom: "30px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
        <h3 style={{ marginTop: "0", color: "#0056b3", borderBottom: "2px solid #0056b3", paddingBottom: "10px" }}>📋 Recent Predictions</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f5f5f5", borderBottom: "2px solid #ddd" }}>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold", color: "#333" }}>Time</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold", color: "#333" }}>District</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold", color: "#333" }}>Risk Score</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold", color: "#333" }}>Risk Level</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold", color: "#333" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {predictionTimeline.map((pred, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "12px", fontSize: "12px" }}>{pred.time}</td>
                  <td style={{ padding: "12px" }}>{pred.district}</td>
                  <td style={{ padding: "12px", fontWeight: "bold", color: getRiskColor(pred.level) }}>{pred.score.toFixed(2)}</td>
                  <td style={{ padding: "12px" }}>
                    <span style={{ backgroundColor: getRiskColor(pred.level), color: "white", padding: "4px 8px", borderRadius: "4px", fontSize: "12px" }}>
                      {pred.level}
                    </span>
                  </td>
                  <td style={{ padding: "12px" }}>
                    <span style={{ backgroundColor: getStatusColor(pred.status), color: "white", padding: "4px 8px", borderRadius: "4px", fontSize: "12px" }}>
                      {pred.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Button */}
      <div style={{ textAlign: "center" }}>
        <button
          onClick={handleExportReport}
          style={{ padding: "12px 30px", fontSize: "16px", fontWeight: "bold", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
        >
          📥 Download Report
        </button>
      </div>
    </div>
  );
}