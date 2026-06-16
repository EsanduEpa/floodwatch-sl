import { useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";

export default function MapPage() {
  // =========================
  // Dummy Prediction Data (with coordinates)
  // =========================
  const predictionData = [
    { id: 1, district: "Colombo", lat: 6.9271, lng: 80.7789, score: 0.92, level: "Critical", place: "Colombo City" },
    { id: 2, district: "Galle", lat: 6.0535, lng: 80.1684, score: 0.85, level: "Critical", place: "Galle Fort" },
    { id: 3, district: "Kandy", lat: 6.9271, lng: 80.6366, score: 0.76, level: "High", place: "Kandy City" },
    { id: 4, district: "Matara", lat: 5.7489, lng: 80.5353, score: 0.38, level: "Moderate", place: "Matara Town" },
    { id: 5, district: "Jaffna", lat: 9.6615, lng: 80.7855, score: 0.68, level: "High", place: "Jaffna City" },
    { id: 6, district: "Trincomalee", lat: 8.5874, lng: 81.2152, score: 0.45, level: "Moderate", place: "Trincomalee Port" },
    { id: 7, district: "Batticaloa", lat: 7.7081, lng: 81.7689, score: 0.92, level: "Critical", place: "Batticaloa Lagoon" },
    { id: 8, district: "Ratnapura", lat: 6.6828, lng: 80.3945, score: 0.72, level: "High", place: "Ratnapura Town" },
    { id: 9, district: "Nuwara Eliya", lat: 6.9497, lng: 80.7891, score: 0.25, level: "Low", place: "Nuwara Eliya City" },
    { id: 10, district: "Badulla", lat: 6.9906, lng: 81.0551, score: 0.55, level: "Moderate", place: "Badulla Town" },
    { id: 11, district: "Matale", lat: 7.2806, lng: 80.6328, score: 0.48, level: "Moderate", place: "Matale Town" },
    { id: 12, district: "Kurunegala", lat: 7.4833, lng: 80.3667, score: 0.62, level: "High", place: "Kurunegala City" },
  ];

  const sriLankaCenter = [7.8731, 80.7718];

  // =========================
  // State
  // =========================
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedRiskLevel, setSelectedRiskLevel] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [showHeatmap, setShowHeatmap] = useState(false);

  // =========================
  // Filter Data
  // =========================
  const filteredData = useMemo(() => {
    return predictionData.filter((item) => {
      const matchDistrict = selectedDistrict === "" || item.district === selectedDistrict;
      const matchRisk = selectedRiskLevel === "" || item.level === selectedRiskLevel;
      const matchSearch = searchTerm === "" || item.district.toLowerCase().includes(searchTerm.toLowerCase()) || item.place.toLowerCase().includes(searchTerm.toLowerCase());
      return matchDistrict && matchRisk && matchSearch;
    });
  }, [selectedDistrict, selectedRiskLevel, searchTerm]);

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

  const getMarkerIcon = (level) => {
    const color = getRiskColor(level);
    return new L.Icon({
      iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${
        level === "Critical" ? "red" : level === "High" ? "orange" : level === "Moderate" ? "yellow" : "green"
      }.png`,
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
  };

  const districts = [...new Set(predictionData.map((item) => item.district))];
  const riskLevels = ["Low", "Moderate", "High", "Critical"];

  // =========================
  // UI
  // =========================
  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <h1 style={{ textAlign: "center", color: "#333", marginBottom: "20px" }}>🗺️ Flood Risk Map</h1>

      {/* Controls */}
      <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px", marginBottom: "20px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
        <h3 style={{ marginTop: "0", color: "#0056b3", marginBottom: "15px" }}>🔍 Filters & Search</h3>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", marginBottom: "15px" }}>
          {/* Search */}
          <input
            type="text"
            placeholder="Search district or place..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: "10px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "14px" }}
          />

          {/* District Filter */}
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            style={{ padding: "10px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "14px" }}
          >
            <option value="">All Districts</option>
            {districts.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>

          {/* Risk Level Filter */}
          <select
            value={selectedRiskLevel}
            onChange={(e) => setSelectedRiskLevel(e.target.value)}
            style={{ padding: "10px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "14px" }}
          >
            <option value="">All Risk Levels</option>
            {riskLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>

          {/* Heatmap Toggle */}
          <label style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={showHeatmap}
              onChange={(e) => setShowHeatmap(e.target.checked)}
            />
            <span>Show Heatmap</span>
          </label>
        </div>

        {/* Results Count */}
        <p style={{ margin: "0", color: "#666", fontSize: "14px" }}>
          Showing <strong>{filteredData.length}</strong> prediction{filteredData.length !== 1 ? "s" : ""} out of <strong>{predictionData.length}</strong>
        </p>
      </div>

      {/* Map */}
      <div style={{ backgroundColor: "white", borderRadius: "8px", overflow: "hidden", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", marginBottom: "20px" }}>
        <MapContainer center={sriLankaCenter} zoom={8} style={{ height: "500px", width: "100%" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />

          {/* Heatmap Circles */}
          {showHeatmap &&
            filteredData.map((location) => (
              <Circle
                key={`heat-${location.id}`}
                center={[location.lat, location.lng]}
                radius={15000}
                fillColor={getRiskColor(location.level)}
                fillOpacity={0.3}
                color={getRiskColor(location.level)}
                weight={2}
              />
            ))}

          {/* Markers */}
          {filteredData.map((location) => (
            <Marker
              key={location.id}
              position={[location.lat, location.lng]}
              icon={getMarkerIcon(location.level)}
              eventHandlers={{
                click: () => setSelectedMarker(location),
              }}
            >
              <Popup>
                <div style={{ fontSize: "12px", minWidth: "200px" }}>
                  <h4 style={{ margin: "0 0 10px 0", color: "#0056b3" }}>{location.place}</h4>
                  <p style={{ margin: "5px 0" }}>
                    <strong>District:</strong> {location.district}
                  </p>
                  <p style={{ margin: "5px 0" }}>
                    <strong>Risk Score:</strong> <span style={{ color: getRiskColor(location.level), fontWeight: "bold" }}>{location.score.toFixed(2)}</span>
                  </p>
                  <p style={{ margin: "5px 0" }}>
                    <strong>Risk Level:</strong>{" "}
                    <span style={{ backgroundColor: getRiskColor(location.level), color: "white", padding: "2px 6px", borderRadius: "3px", fontSize: "11px" }}>
                      {location.level}
                    </span>
                  </p>
                  <p style={{ margin: "5px 0", color: "#666", fontSize: "11px" }}>
                    Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Legend */}
      <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px", marginBottom: "20px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
        <h3 style={{ marginTop: "0", color: "#0056b3", marginBottom: "15px" }}>📋 Legend</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "15px" }}>
          {riskLevels.map((level) => (
            <div key={level} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "20px", height: "20px", backgroundColor: getRiskColor(level), borderRadius: "50%" }}></div>
              <span style={{ fontSize: "14px" }}>{level} Risk</span>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Marker Details */}
      {selectedMarker && (
        <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
            <h3 style={{ margin: "0", color: "#0056b3" }}>📍 Selected Location Details</h3>
            <button
              onClick={() => setSelectedMarker(null)}
              style={{
                padding: "5px 10px",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              Close
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px" }}>
            <div>
              <p style={{ margin: "0", color: "#666", fontSize: "12px" }}>Place Name</p>
              <p style={{ margin: "5px 0 0 0", fontWeight: "bold", fontSize: "16px" }}>{selectedMarker.place}</p>
            </div>
            <div>
              <p style={{ margin: "0", color: "#666", fontSize: "12px" }}>District</p>
              <p style={{ margin: "5px 0 0 0", fontWeight: "bold", fontSize: "16px" }}>{selectedMarker.district}</p>
            </div>
            <div>
              <p style={{ margin: "0", color: "#666", fontSize: "12px" }}>Risk Score</p>
              <p style={{ margin: "5px 0 0 0", fontWeight: "bold", fontSize: "16px", color: getRiskColor(selectedMarker.level) }}>
                {selectedMarker.score.toFixed(2)}
              </p>
            </div>
            <div>
              <p style={{ margin: "0", color: "#666", fontSize: "12px" }}>Risk Level</p>
              <p style={{ margin: "5px 0 0 0" }}>
                <span style={{ backgroundColor: getRiskColor(selectedMarker.level), color: "white", padding: "4px 8px", borderRadius: "4px", fontSize: "14px", fontWeight: "bold" }}>
                  {selectedMarker.level}
                </span>
              </p>
            </div>
            <div>
              <p style={{ margin: "0", color: "#666", fontSize: "12px" }}>Latitude</p>
              <p style={{ margin: "5px 0 0 0", fontWeight: "bold", fontSize: "14px" }}>{selectedMarker.lat.toFixed(4)}</p>
            </div>
            <div>
              <p style={{ margin: "0", color: "#666", fontSize: "12px" }}>Longitude</p>
              <p style={{ margin: "5px 0 0 0", fontWeight: "bold", fontSize: "14px" }}>{selectedMarker.lng.toFixed(4)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}