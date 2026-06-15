from typing import List, Dict, Any

from pydantic import BaseModel


# ============================================================
# Root API response
# ============================================================

class RootResponse(BaseModel):
    message: str


# ============================================================
# Health endpoint response
# ============================================================

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    model_version: str


# ============================================================
# Model info response
# ============================================================

class ModelInfoResponse(BaseModel):
    model_name: str
    model_version: str
    number_of_models: int
    feature_count: int
    validation_method: str


# ============================================================
# Single prediction
# ============================================================

class PredictRequest(BaseModel):
    record: Dict[str, Any]


class PredictResponse(BaseModel):
    record_id: str
    flood_risk_score: float
    risk_level: str
    model_version: str


# ============================================================
# Batch prediction
# ============================================================

class BatchPredictRequest(BaseModel):
    records: List[Dict[str, Any]]