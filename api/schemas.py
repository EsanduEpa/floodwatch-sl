from typing import List, Dict, Any, Optional

from pydantic import BaseModel


# ============================================================
# Forecast schemas (Task 5)
# ============================================================

class City(BaseModel):
    name: str
    district: str
    lat: float
    lng: float


class CitiesResponse(BaseModel):
    cities: List[City]


class ForecastDay(BaseModel):
    date: str
    rainfall_mm: float
    rainfall_7d_mm: float
    flood_risk_score: float
    risk_level: str


class ForecastSummary(BaseModel):
    max_score: float
    max_risk_level: str
    peak_day: str
    avg_score: float
    min_score: float


class ForecastResponse(BaseModel):
    city: str
    district: str
    forecast: List[ForecastDay]
    summary: ForecastSummary


# ============================================================
# Briefing schemas (Task 6)
# ============================================================

class BriefingDayAction(BaseModel):
    date: str
    risk_level: str
    action: str


class BriefingResponse(BaseModel):
    executive_summary: str
    per_day_actions: List[BriefingDayAction]
    overall_recommendation: str


class ForecastBriefingResponse(ForecastResponse):
    briefing: Optional[BriefingResponse] = None
    briefing_error: Optional[str] = None


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