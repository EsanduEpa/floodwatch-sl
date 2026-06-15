from pathlib import Path

# ============================================================
# Project paths
# ============================================================

# This gets the main project folder path automatically
ROOT_DIR = Path(__file__).resolve().parents[1]

# Folder where the official V014 champion models are saved
MODEL_DIR = ROOT_DIR / "models" / "champion_v014_seed_ensemble"

# Model artifact paths
FEATURE_LIST_PATH = MODEL_DIR / "feature_list.json"
CATEGORICAL_FEATURES_PATH = MODEL_DIR / "categorical_features.json"
SEEDS_PATH = MODEL_DIR / "seeds.json"
MODEL_METADATA_PATH = MODEL_DIR / "model_metadata.json"

# Sample data path for testing prediction pipeline
SAMPLE_DATA_PATH = ROOT_DIR / "data" / "processed" / "test_dropmissing.csv"

# ============================================================
# Column names
# ============================================================

ID_COL = "record_id"
TARGET_COL = "flood_risk_score"

# ============================================================
# Prediction settings
# ============================================================

PREDICTION_MIN = 0.0
PREDICTION_MAX = 1.0

# ============================================================
# Risk level thresholds
# ============================================================

RISK_LEVELS = {
    "Low": (0.0, 0.30),
    "Moderate": (0.30, 0.55),
    "High": (0.55, 0.75),
    "Critical": (0.75, 1.0),
}