import { useState } from "react";

import api from "../services/api";
import RiskBadge from "../components/RiskBadge";
import ErrorAlert from "../components/ErrorAlert";
import LoadingSpinner from "../components/LoadingSpinner";

import styles from "./Prediction.module.css";

// ============================================================
// Form layout — each field has a visible label (shown above the
// input) so the field name stays readable while typing.
// ============================================================
const SECTIONS = [
  {
    title: "📍 Location",
    fields: [
      { name: "district", label: "District", type: "text", required: true },
      { name: "place_name", label: "Place Name", type: "text" },
      { name: "latitude", label: "Latitude", type: "number", step: "0.0001", required: true },
      { name: "longitude", label: "Longitude", type: "number", step: "0.0001", required: true },
      { name: "elevation_m", label: "Elevation (m)", type: "number", step: "0.1" },
    ],
  },
  {
    title: "🌊 Geographic Features",
    fields: [
      { name: "distance_to_river_m", label: "Distance to River (m)", type: "number", step: "0.1" },
      { name: "inundation_area_sqm", label: "Inundation Area (sqm)", type: "number", step: "0.1" },
      { name: "drainage_index", label: "Drainage Index", type: "number", step: "0.01", min: "0", max: "1" },
      { name: "landcover", label: "Land Cover", type: "select", options: ["Agriculture", "Forest", "Scrub", "Urban", "Water"] },
      { name: "soil_type", label: "Soil Type", type: "select", options: ["Sandy", "Silty", "Peaty", "Clay"] },
      { name: "water_presence_flag", label: "Water Presence", type: "select", options: ["Unlikely", "Likely"] },
    ],
  },
  {
    title: "🌿 Vegetation & Water Indices",
    fields: [
      { name: "ndvi", label: "NDVI (-1 to 1)", type: "number", step: "0.01", min: "-1", max: "1" },
      { name: "ndwi", label: "NDWI (-1 to 1)", type: "number", step: "0.01", min: "-1", max: "1" },
    ],
  },
  {
    title: "🌧️ Rainfall",
    fields: [
      { name: "rainfall_7d_mm", label: "7-Day Rainfall (mm)", type: "number", step: "0.1", required: true },
      { name: "monthly_rainfall_mm", label: "Monthly Rainfall (mm)", type: "number", step: "0.1" },
      { name: "seasonal_index", label: "Seasonal Index (0-1)", type: "number", step: "0.01", min: "0", max: "1" },
    ],
  },
  {
    title: "🏘️ Population & Infrastructure",
    fields: [
      { name: "population_density_per_km2", label: "Population Density (per km²)", type: "number", step: "0.1" },
      { name: "built_up_percent", label: "Built-up Percent (%)", type: "number", step: "0.1", min: "0", max: "100" },
      { name: "urban_rural", label: "Urban / Rural", type: "select", options: ["Rural", "Urban"] },
      { name: "water_supply", label: "Water Supply", type: "select", options: ["Surface water", "Well", "Municipal"] },
      { name: "electricity", label: "Electricity", type: "select", options: ["Grid", "Mixed"] },
      { name: "road_quality", label: "Road Quality", type: "select", options: ["Good (paved)", "Fair", "Poor"] },
      { name: "infrastructure_score", label: "Infrastructure Score (0-100)", type: "number", step: "0.1", min: "0", max: "100" },
    ],
  },
  {
    title: "🏥 Proximity & Emergency",
    fields: [
      { name: "nearest_hospital_km", label: "Nearest Hospital (km)", type: "number", step: "0.1" },
      { name: "nearest_evac_km", label: "Nearest Evacuation Point (km)", type: "number", step: "0.1" },
    ],
  },
  {
    title: "⚠️ Flood & Environmental Indices",
    fields: [
      { name: "historical_flood_count", label: "Historical Flood Count", type: "number", step: "1", min: "0" },
      { name: "flood_occurrence_current_event", label: "Flood Occurrence (Current Event)", type: "select", options: ["No", "Yes"] },
      { name: "terrain_roughness_index", label: "Terrain Roughness Index", type: "number", step: "0.01" },
      { name: "socioeconomic_status_index", label: "Socioeconomic Status Index (0-1)", type: "number", step: "0.01", min: "0", max: "1" },
      { name: "extreme_weather_index", label: "Extreme Weather Index (0-1)", type: "number", step: "0.01", min: "0", max: "1" },
    ],
  },
  {
    title: "🏠 Livability",
    fields: [
      { name: "is_good_to_live", label: "Good to Live?", type: "select", options: ["Yes", "No"] },
      { name: "reason_not_good_to_live", label: "Reason Not Good to Live", type: "select", options: ["Other", "Poor infrastructure", "Flood prone", "Limited services"] },
    ],
  },
  {
    title: "📅 Metadata",
    fields: [
      { name: "generation_date", label: "Generation Date", type: "date" },
      { name: "is_synthetic", label: "Synthetic Data", type: "checkbox" },
    ],
  },
];

function Prediction() {
  // =========================
  // Input States
  // =========================
  const [formData, setFormData] = useState({
    district: "",
    latitude: "",
    longitude: "",
    rainfall_7d_mm: "",
    monthly_rainfall_mm: "",
    distance_to_river_m: "",
    inundation_area_sqm: "",
    elevation_m: "",
    landcover: "Agriculture",
    soil_type: "Sandy",
    water_supply: "Surface water",
    electricity: "Grid",
    road_quality: "Fair",
    population_density_per_km2: "",
    built_up_percent: "",
    urban_rural: "Rural",
    drainage_index: "",
    ndvi: "",
    ndwi: "",
    water_presence_flag: "Unlikely",
    historical_flood_count: "",
    infrastructure_score: "",
    nearest_hospital_km: "",
    nearest_evac_km: "",
    flood_occurrence_current_event: "No",
    place_name: "",
    is_good_to_live: "Yes",
    reason_not_good_to_live: "Other",
    is_synthetic: false,
    generation_date: new Date().toISOString().split("T")[0],
    seasonal_index: "",
    terrain_roughness_index: "",
    socioeconomic_status_index: "",
    extreme_weather_index: "",
  });

  // =========================
  // Output States
  // =========================
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // =========================
  // Input Change Handler
  // =========================
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // =========================
  // API Call
  // =========================
  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    setPrediction(null);

    try {
      const record = {
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        rainfall_7d_mm: parseFloat(formData.rainfall_7d_mm),
        monthly_rainfall_mm: parseFloat(formData.monthly_rainfall_mm),
        distance_to_river_m: parseFloat(formData.distance_to_river_m),
        inundation_area_sqm: parseFloat(formData.inundation_area_sqm),
        elevation_m: parseFloat(formData.elevation_m),
        population_density_per_km2: parseFloat(formData.population_density_per_km2),
        built_up_percent: parseFloat(formData.built_up_percent),
        drainage_index: parseFloat(formData.drainage_index),
        ndvi: parseFloat(formData.ndvi),
        ndwi: parseFloat(formData.ndwi),
        historical_flood_count: parseFloat(formData.historical_flood_count),
        infrastructure_score: parseFloat(formData.infrastructure_score),
        nearest_hospital_km: parseFloat(formData.nearest_hospital_km),
        nearest_evac_km: parseFloat(formData.nearest_evac_km),
        seasonal_index: parseFloat(formData.seasonal_index),
        terrain_roughness_index: parseFloat(formData.terrain_roughness_index),
        socioeconomic_status_index: parseFloat(formData.socioeconomic_status_index),
        extreme_weather_index: parseFloat(formData.extreme_weather_index),
      };

      const response = await api.post("/predict", { record });
      setPrediction(response.data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
          "Prediction failed. Please check backend or inputs."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // Field renderer
  // =========================
  const renderField = (field) => {
    const { name, label, type, required, options, step, min, max } = field;

    if (type === "checkbox") {
      return (
        <div className={styles.field} key={name}>
          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              name={name}
              checked={formData[name]}
              onChange={handleInputChange}
            />
            {label}
          </label>
        </div>
      );
    }

    return (
      <div className={styles.field} key={name}>
        <label className={styles.label} htmlFor={name}>
          {label}
          {required && <span className={styles.req}>*</span>}
        </label>

        {type === "select" ? (
          <select
            id={name}
            className={styles.select}
            name={name}
            value={formData[name]}
            onChange={handleInputChange}
          >
            {options.map((opt) => (
              <option key={opt}>{opt}</option>
            ))}
          </select>
        ) : (
          <input
            id={name}
            className={styles.input}
            type={type}
            name={name}
            step={step}
            min={min}
            max={max}
            value={formData[name]}
            onChange={handleInputChange}
          />
        )}
      </div>
    );
  };

  // =========================
  // UI
  // =========================
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>FloodWatch SL — Prediction</h1>
        <p className={styles.subtitle}>Enter location and environmental data</p>
      </div>

      <div className={styles.card}>
        {SECTIONS.map((section) => (
          <section className={styles.section} key={section.title}>
            <h3 className={styles.sectionTitle}>{section.title}</h3>
            <div className={styles.grid}>
              {section.fields.map(renderField)}
            </div>
          </section>
        ))}

        <button
          className={styles.button}
          onClick={handlePredict}
          disabled={loading}
        >
          {loading ? (
            <LoadingSpinner label="Predicting..." />
          ) : (
            "Get Flood Risk Prediction"
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className={styles.feedback}>
          <ErrorAlert message={error} />
        </div>
      )}

      {/* Result */}
      {prediction && (
        <div className={styles.result}>
          <h2 className={styles.resultTitle}>Prediction Result</h2>

          <div className={styles.scoreRow}>
            <span className={styles.scoreValue}>
              {prediction.flood_risk_score.toFixed(4)}
            </span>
            <RiskBadge riskLevel={prediction.risk_level} />
          </div>

          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>Model Version</span>
            <span className={styles.metaValue}>{prediction.model_version}</span>
          </div>
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>Record ID</span>
            <span className={styles.metaValue}>{prediction.record_id}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default Prediction;
