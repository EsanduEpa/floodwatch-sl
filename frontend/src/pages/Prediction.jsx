import { useState } from "react";
import api from "../services/api";

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
    generation_date: new Date().toISOString().split('T')[0],
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

  // Helper function for risk level colors
  const getRiskLevelColor = (level) => {
    switch (level) {
      case "Low":
        return "green";
      case "Moderate":
        return "orange";
      case "High":
        return "orangered";
      case "Critical":
        return "red";
      default:
        return "black";
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <div style={{ padding: "30px", fontFamily: "Arial, sans-serif", maxWidth: "900px", margin: "0 auto", backgroundColor: "#f5f5f5", borderRadius: "8px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "10px", color: "#333", fontSize: "28px" }}>FloodWatch SL - Prediction</h2>
      <p style={{ textAlign: "center", marginBottom: "20px", color: "#666", fontSize: "14px" }}>Enter location and environmental data</p>

      {/* Form Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "15px", marginBottom: "20px" }}>
        
        {/* Location Section */}
        <h3 style={{ gridColumn: "1 / -1", marginTop: "20px", marginBottom: "10px", fontSize: "16px", fontWeight: "bold", color: "#0056b3", borderBottom: "2px solid #0056b3", paddingBottom: "5px" }}>📍 Location</h3>

        <input
          style={{ padding: "12px", fontSize: "14px", border: "1px solid #ddd", borderRadius: "4px", fontFamily: "Arial, sans-serif" }}
          type="text"
          name="district"
          placeholder="District *"
          value={formData.district}
          onChange={handleInputChange}
        />

        <input
          style={{ padding: "12px", fontSize: "14px", border: "1px solid #ddd", borderRadius: "4px", fontFamily: "Arial, sans-serif" }}
          type="text"
          name="place_name"
          placeholder="Place Name"
          value={formData.place_name}
          onChange={handleInputChange}
        />

        <input
          style={{ padding: "12px", fontSize: "14px", border: "1px solid #ddd", borderRadius: "4px", fontFamily: "Arial, sans-serif" }}
          type="number"
          name="latitude"
          placeholder="Latitude *"
          step="0.0001"
          value={formData.latitude}
          onChange={handleInputChange}
        />

        <input
          style={{ padding: "12px", fontSize: "14px", border: "1px solid #ddd", borderRadius: "4px", fontFamily: "Arial, sans-serif" }}
          type="number"
          name="longitude"
          placeholder="Longitude *"
          step="0.0001"
          value={formData.longitude}
          onChange={handleInputChange}
        />

        <input
          style={{ padding: "12px", fontSize: "14px", border: "1px solid #ddd", borderRadius: "4px", fontFamily: "Arial, sans-serif" }}
          type="number"
          name="elevation_m"
          placeholder="Elevation (m)"
          step="0.1"
          value={formData.elevation_m}
          onChange={handleInputChange}
        />

        {/* Geographic Features */}
        <h3 style={{ gridColumn: "1 / -1", marginTop: "20px", marginBottom: "10px", fontSize: "16px", fontWeight: "bold", color: "#0056b3", borderBottom: "2px solid #0056b3", paddingBottom: "5px" }}>🌊 Geographic Features</h3>

        <input
          style={{ padding: "12px", fontSize: "14px", border: "1px solid #ddd", borderRadius: "4px", fontFamily: "Arial, sans-serif" }}
          type="number"
          name="distance_to_river_m"
          placeholder="Distance to River (m)"
          step="0.1"
          value={formData.distance_to_river_m}
          onChange={handleInputChange}
        />

        <input
          style={{ padding: "12px", fontSize: "14px", border: "1px solid #ddd", borderRadius: "4px", fontFamily: "Arial, sans-serif" }}
          type="number"
          name="inundation_area_sqm"
          placeholder="Inundation Area (sqm)"
          step="0.1"
          value={formData.inundation_area_sqm}
          onChange={handleInputChange}
        />

        <input
          style={{ padding: "12px", fontSize: "14px", border: "1px solid #ddd", borderRadius: "4px", fontFamily: "Arial, sans-serif" }}
          type="number"
          name="drainage_index"
          placeholder="Drainage Index"
          step="0.01"
          min="0"
          max="1"
          value={formData.drainage_index}
          onChange={handleInputChange}
        />

        <select
          style={{ padding: "12px", fontSize: "14px", border: "1px solid #ddd", borderRadius: "4px", fontFamily: "Arial, sans-serif" }}
          name="landcover"
          value={formData.landcover}
          onChange={handleInputChange}
        >
          <option>Agriculture</option>
          <option>Forest</option>
          <option>Scrub</option>
          <option>Urban</option>
          <option>Water</option>
        </select>

        <select
          style={{ padding: "12px", fontSize: "14px", border: "1px solid #ddd", borderRadius: "4px", fontFamily: "Arial, sans-serif" }}
          name="soil_type"
          value={formData.soil_type}
          onChange={handleInputChange}
        >
          <option>Sandy</option>
          <option>Silty</option>
          <option>Peaty</option>
          <option>Clay</option>
        </select>

        <select
          style={{ padding: "12px", fontSize: "14px", border: "1px solid #ddd", borderRadius: "4px", fontFamily: "Arial, sans-serif" }}
          name="water_presence_flag"
          value={formData.water_presence_flag}
          onChange={handleInputChange}
        >
          <option>Unlikely</option>
          <option>Likely</option>
        </select>

        {/* Vegetation Indices */}
        <h3 style={{ gridColumn: "1 / -1", marginTop: "20px", marginBottom: "10px", fontSize: "16px", fontWeight: "bold", color: "#0056b3", borderBottom: "2px solid #0056b3", paddingBottom: "5px" }}>🌿 Vegetation & Water Indices</h3>

        <input
          style={{ padding: "12px", fontSize: "14px", border: "1px solid #ddd", borderRadius: "4px", fontFamily: "Arial, sans-serif" }}
          type="number"
          name="ndvi"
          placeholder="NDVI (-1 to 1)"
          step="0.01"
          min="-1"
          max="1"
          value={formData.ndvi}
          onChange={handleInputChange}
        />

        <input
          style={{ padding: "12px", fontSize: "14px", border: "1px solid #ddd", borderRadius: "4px", fontFamily: "Arial, sans-serif" }}
          type="number"
          name="ndwi"
          placeholder="NDWI (-1 to 1)"
          step="0.01"
          min="-1"
          max="1"
          value={formData.ndwi}
          onChange={handleInputChange}
        />

        {/* Rainfall */}
        <h3 style={{ gridColumn: "1 / -1", marginTop: "20px", marginBottom: "10px", fontSize: "16px", fontWeight: "bold", color: "#0056b3", borderBottom: "2px solid #0056b3", paddingBottom: "5px" }}>🌧️ Rainfall</h3>

        <input
          style={{ padding: "12px", fontSize: "14px", border: "1px solid #ddd", borderRadius: "4px", fontFamily: "Arial, sans-serif" }}
          type="number"
          name="rainfall_7d_mm"
          placeholder="7-Day Rainfall (mm) *"
          step="0.1"
          value={formData.rainfall_7d_mm}
          onChange={handleInputChange}
        />

        <input
          style={{ padding: "12px", fontSize: "14px", border: "1px solid #ddd", borderRadius: "4px", fontFamily: "Arial, sans-serif" }}
          type="number"
          name="monthly_rainfall_mm"
          placeholder="Monthly Rainfall (mm)"
          step="0.1"
          value={formData.monthly_rainfall_mm}
          onChange={handleInputChange}
        />

        <input
          style={{ padding: "12px", fontSize: "14px", border: "1px solid #ddd", borderRadius: "4px", fontFamily: "Arial, sans-serif" }}
          type="number"
          name="seasonal_index"
          placeholder="Seasonal Index (0-1)"
          step="0.01"
          min="0"
          max="1"
          value={formData.seasonal_index}
          onChange={handleInputChange}
        />

        {/* Population & Infrastructure */}
        <h3 style={{ gridColumn: "1 / -1", marginTop: "20px", marginBottom: "10px", fontSize: "16px", fontWeight: "bold", color: "#0056b3", borderBottom: "2px solid #0056b3", paddingBottom: "5px" }}>🏘️ Population & Infrastructure</h3>

        <input
          style={{ padding: "12px", fontSize: "14px", border: "1px solid #ddd", borderRadius: "4px", fontFamily: "Arial, sans-serif" }}
          type="number"
          name="population_density_per_km2"
          placeholder="Population Density (per km²)"
          step="0.1"
          value={formData.population_density_per_km2}
          onChange={handleInputChange}
        />

        <input
          style={{ padding: "12px", fontSize: "14px", border: "1px solid #ddd", borderRadius: "4px", fontFamily: "Arial, sans-serif" }}
          type="number"
          name="built_up_percent"
          placeholder="Built-up Percent (%)"
          step="0.1"
          min="0"
          max="100"
          value={formData.built_up_percent}
          onChange={handleInputChange}
        />

        <select
          style={{ padding: "12px", fontSize: "14px", border: "1px solid #ddd", borderRadius: "4px", fontFamily: "Arial, sans-serif" }}
          name="urban_rural"
          value={formData.urban_rural}
          onChange={handleInputChange}
        >
          <option>Rural</option>
          <option>Urban</option>
        </select>

        <select
          style={{ padding: "12px", fontSize: "14px", border: "1px solid #ddd", borderRadius: "4px", fontFamily: "Arial, sans-serif" }}
          name="water_supply"
          value={formData.water_supply}
          onChange={handleInputChange}
        >
          <option>Surface water</option>
          <option>Well</option>
          <option>Municipal</option>
        </select>

        <select
          style={{ padding: "12px", fontSize: "14px", border: "1px solid #ddd", borderRadius: "4px", fontFamily: "Arial, sans-serif" }}
          name="electricity"
          value={formData.electricity}
          onChange={handleInputChange}
        >
          <option>Grid</option>
          <option>Mixed</option>
        </select>

        <select
          style={{ padding: "12px", fontSize: "14px", border: "1px solid #ddd", borderRadius: "4px", fontFamily: "Arial, sans-serif" }}
          name="road_quality"
          value={formData.road_quality}
          onChange={handleInputChange}
        >
          <option>Good (paved)</option>
          <option>Fair</option>
          <option>Poor</option>
        </select>

        <input
          style={{ padding: "12px", fontSize: "14px", border: "1px solid #ddd", borderRadius: "4px", fontFamily: "Arial, sans-serif" }}
          type="number"
          name="infrastructure_score"
          placeholder="Infrastructure Score (0-100)"
          step="0.1"
          min="0"
          max="100"
          value={formData.infrastructure_score}
          onChange={handleInputChange}
        />

        {/* Proximity Indices */}
        <h3 style={{ gridColumn: "1 / -1", marginTop: "20px", marginBottom: "10px", fontSize: "16px", fontWeight: "bold", color: "#0056b3", borderBottom: "2px solid #0056b3", paddingBottom: "5px" }}>🏥 Proximity & Emergency</h3>

        <input
          style={{ padding: "12px", fontSize: "14px", border: "1px solid #ddd", borderRadius: "4px", fontFamily: "Arial, sans-serif" }}
          type="number"
          name="nearest_hospital_km"
          placeholder="Nearest Hospital (km)"
          step="0.1"
          value={formData.nearest_hospital_km}
          onChange={handleInputChange}
        />

        <input
          style={{ padding: "12px", fontSize: "14px", border: "1px solid #ddd", borderRadius: "4px", fontFamily: "Arial, sans-serif" }}
          type="number"
          name="nearest_evac_km"
          placeholder="Nearest Evacuation Point (km)"
          step="0.1"
          value={formData.nearest_evac_km}
          onChange={handleInputChange}
        />

        {/* Flood & Environmental Indices */}
        <h3 style={{ gridColumn: "1 / -1", marginTop: "20px", marginBottom: "10px", fontSize: "16px", fontWeight: "bold", color: "#0056b3", borderBottom: "2px solid #0056b3", paddingBottom: "5px" }}>⚠️ Flood & Environmental Indices</h3>

        <input
          style={{ padding: "12px", fontSize: "14px", border: "1px solid #ddd", borderRadius: "4px", fontFamily: "Arial, sans-serif" }}
          type="number"
          name="historical_flood_count"
          placeholder="Historical Flood Count"
          step="1"
          min="0"
          value={formData.historical_flood_count}
          onChange={handleInputChange}
        />

        <select
          style={{ padding: "12px", fontSize: "14px", border: "1px solid #ddd", borderRadius: "4px", fontFamily: "Arial, sans-serif" }}
          name="flood_occurrence_current_event"
          value={formData.flood_occurrence_current_event}
          onChange={handleInputChange}
        >
          <option>No</option>
          <option>Yes</option>
        </select>

        <input
          style={{ padding: "12px", fontSize: "14px", border: "1px solid #ddd", borderRadius: "4px", fontFamily: "Arial, sans-serif" }}
          type="number"
          name="terrain_roughness_index"
          placeholder="Terrain Roughness Index"
          step="0.01"
          value={formData.terrain_roughness_index}
          onChange={handleInputChange}
        />

        <input
          style={{ padding: "12px", fontSize: "14px", border: "1px solid #ddd", borderRadius: "4px", fontFamily: "Arial, sans-serif" }}
          type="number"
          name="socioeconomic_status_index"
          placeholder="Socioeconomic Status Index (0-1)"
          step="0.01"
          min="0"
          max="1"
          value={formData.socioeconomic_status_index}
          onChange={handleInputChange}
        />

        <input
          style={{ padding: "12px", fontSize: "14px", border: "1px solid #ddd", borderRadius: "4px", fontFamily: "Arial, sans-serif" }}
          type="number"
          name="extreme_weather_index"
          placeholder="Extreme Weather Index (0-1)"
          step="0.01"
          min="0"
          max="1"
          value={formData.extreme_weather_index}
          onChange={handleInputChange}
        />

        {/* Livability */}
        <h3 style={{ gridColumn: "1 / -1", marginTop: "20px", marginBottom: "10px", fontSize: "16px", fontWeight: "bold", color: "#0056b3", borderBottom: "2px solid #0056b3", paddingBottom: "5px" }}>🏠 Livability</h3>

        <select
          style={{ padding: "12px", fontSize: "14px", border: "1px solid #ddd", borderRadius: "4px", fontFamily: "Arial, sans-serif" }}
          name="is_good_to_live"
          value={formData.is_good_to_live}
          onChange={handleInputChange}
        >
          <option>Yes</option>
          <option>No</option>
        </select>

        <select
          style={{ padding: "12px", fontSize: "14px", border: "1px solid #ddd", borderRadius: "4px", fontFamily: "Arial, sans-serif" }}
          name="reason_not_good_to_live"
          value={formData.reason_not_good_to_live}
          onChange={handleInputChange}
        >
          <option>Other</option>
          <option>Poor infrastructure</option>
          <option>Flood prone</option>
          <option>Limited services</option>
        </select>

        {/* Metadata */}
        <h3 style={{ gridColumn: "1 / -1", marginTop: "20px", marginBottom: "10px", fontSize: "16px", fontWeight: "bold", color: "#0056b3", borderBottom: "2px solid #0056b3", paddingBottom: "5px" }}>📅 Metadata</h3>

        <input
          style={{ padding: "12px", fontSize: "14px", border: "1px solid #ddd", borderRadius: "4px", fontFamily: "Arial, sans-serif" }}
          type="date"
          name="generation_date"
          value={formData.generation_date}
          onChange={handleInputChange}
        />

        <label style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px", fontSize: "14px", cursor: "pointer" }}>
          <input
            type="checkbox"
            name="is_synthetic"
            checked={formData.is_synthetic}
            onChange={handleInputChange}
          />
          Synthetic Data
        </label>

        {/* Submit Button */}
        <button
          style={{ gridColumn: "1 / -1", padding: "12px", fontSize: "16px", fontWeight: "bold", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", marginTop: "10px" }}
          onClick={handlePredict}
          disabled={loading}
        >
          {loading ? "Predicting..." : "Get Flood Risk Prediction"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: "15px", backgroundColor: "#f8d7da", color: "#721c24", border: "1px solid #f5c6cb", borderRadius: "4px", marginTop: "15px" }}>
          {error}
        </div>
      )}

      {/* Result */}
      {prediction && (
        <div style={{ marginTop: "20px", padding: "20px", backgroundColor: "#d4edda", border: "1px solid #c3e6cb", borderRadius: "4px", color: "#155724" }}>
          <h2>📊 Prediction Result</h2>
          <p>
            <b>Flood Risk Score:</b> <span style={{ fontSize: "20px", fontWeight: "bold", color: "#0056b3" }}>{prediction.flood_risk_score.toFixed(4)}</span>
          </p>
          <p>
            <b>Risk Level:</b>{" "}
            <span style={{ fontSize: "18px", fontWeight: "bold", color: getRiskLevelColor(prediction.risk_level) }}>
              {prediction.risk_level}
            </span>
          </p>
          <p>
            <b>Model Version:</b> {prediction.model_version}
          </p>
          <p>
            <b>Record ID:</b> {prediction.record_id}
          </p>
        </div>
      )}
    </div>
  );
}

export default Prediction;