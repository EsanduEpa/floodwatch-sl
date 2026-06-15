from fastapi import FastAPI

from src.predict import load_model_metadata, load_models
from api.schemas import (
    RootResponse,
    HealthResponse,
    ModelInfoResponse,
)


# ============================================================
# App setup
# ============================================================

app = FastAPI(
    title="FloodWatch SL API",
    description="Flood Risk Prediction API using V014 CatBoost Seed Ensemble",
    version="1.0.0",
)


# ============================================================
# Load model at startup
# ============================================================

print("Loading V014 models...")

models = load_models()
metadata = load_model_metadata()

print(f"Loaded {len(models)} models successfully.")


# ============================================================
# Root endpoint
# ============================================================

@app.get("/", response_model=RootResponse)
def home():
    return {
        "message": "FloodWatch SL API is running"
    }


# ============================================================
# Health endpoint
# ============================================================

@app.get("/health", response_model=HealthResponse)
def health_check():
    return {
        "status": "ok",
        "model_loaded": len(models) > 0,
        "model_version": metadata.get("model_version", "champion_v014_seed_ensemble"),
    }


# ============================================================
# Model info endpoint
# ============================================================

@app.get("/model-info", response_model=ModelInfoResponse)
def model_info():
    """
    Returns information about the trained V014 model.
    """

    return {
        "model_name": "CatBoost Alpha Pack Drop-Missing Seed Ensemble",
        "model_version": metadata.get("model_version", "champion_v014_seed_ensemble"),
        "number_of_models": len(models),
        "feature_count": metadata.get("feature_count", 35),
        "validation_method": metadata.get("validation_method", "Target-binned StratifiedKFold"),
    }