from __future__ import annotations
from fastapi.middleware.cors import CORSMiddleware
import uuid
from contextlib import asynccontextmanager
from typing import List

import pandas as pd
from fastapi import FastAPI, HTTPException

from api.schemas import (
    BatchPredictRequest,
    HealthResponse,
    ModelInfoResponse,
    PredictRequest,
    PredictResponse,
    RootResponse,
)
from src.logger import get_prediction_stats, get_recent_predictions, init_db, log_prediction
from src.predict import load_model_metadata, load_models, predict_batch

# These hold the models and metadata in memory while the server runs.
# They start as None and get filled when the server starts.
_models = None
_metadata = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Everything before 'yield' runs once when the server starts.
    Everything after 'yield' runs when the server shuts down.
    """
    global _models, _metadata
    print("Server starting — loading 25 models into memory...")
    _models = load_models()
    _metadata = load_model_metadata()
    init_db()
    print(f"Ready. {len(_models)} models loaded.")
    yield
    # Nothing needed on shutdown


app = FastAPI(
    title="FloodWatch SL API",
    version="1.0.0",
    description="Production flood risk prediction API for Sri Lanka",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # allows any frontend to connect
    allow_credentials=True,
    allow_methods=["*"],      # allows GET, POST, etc.
    allow_headers=["*"],
)


# ── Helpers ───────────────────────────────────────────────────────────────────

def _version() -> str:
    return _metadata.get("model_version", "unknown") if _metadata else "unknown"


# ── Status endpoints (these already existed) ──────────────────────────────────

@app.get("/", response_model=RootResponse)
def root():
    return {"message": "FloodWatch SL API is running"}


@app.get("/health", response_model=HealthResponse)
def health():
    return {
        "status": "ok",
        "model_loaded": _models is not None,
        "model_version": _version(),
    }


@app.get("/model-info", response_model=ModelInfoResponse)
def model_info():
    if not _metadata:
        raise HTTPException(status_code=503, detail="Model not loaded")
    return {
        "model_name":        _metadata.get("model_name"),
        "model_version":     _metadata.get("model_version"),
        "number_of_models":  _metadata.get("number_of_models"),
        "feature_count":     _metadata.get("feature_count"),
        "validation_method": _metadata.get("validation_method"),
    }


# ── Prediction endpoints (new) ────────────────────────────────────────────────

@app.post("/predict", response_model=PredictResponse)
def predict_single(request: PredictRequest):
    """
    Send one location record, get back one flood risk score.
    """
    record = dict(request.record)

    # Generate a random ID if the record doesn't have one
    if "record_id" not in record:
        record["record_id"] = str(uuid.uuid4())[:8]

    try:
        result  = predict_batch(pd.DataFrame([record]), models=_models)
        row     = result.iloc[0]
        score   = float(row["flood_risk_score"])
        level   = str(row["risk_level"])
        version = str(row["model_version"])
        rid     = str(row["record_id"])

        # Save this prediction to the database
        log_prediction(rid, record, score, level, version)

        return PredictResponse(
            record_id=rid,
            flood_risk_score=score,
            risk_level=level,
            model_version=version,
        )
    except Exception as e:
        raise HTTPException(status_code=422, detail=str(e))


@app.post("/predict/batch", response_model=List[PredictResponse])
def predict_batch_endpoint(request: BatchPredictRequest):
    """
    Send multiple location records, get back scores for all of them.
    """
    records = [dict(r) for r in request.records]

    for r in records:
        if "record_id" not in r:
            r["record_id"] = str(uuid.uuid4())[:8]

    try:
        results   = predict_batch(pd.DataFrame(records), models=_models)
        responses = []

        for _, row in results.iterrows():
            score   = float(row["flood_risk_score"])
            level   = str(row["risk_level"])
            version = str(row["model_version"])
            rid     = str(row["record_id"])

            log_prediction(rid, row.to_dict(), score, level, version)

            responses.append(PredictResponse(
                record_id=rid,
                flood_risk_score=score,
                risk_level=level,
                model_version=version,
            ))

        return responses
    except Exception as e:
        raise HTTPException(status_code=422, detail=str(e))


# ── Monitoring endpoints (new) ────────────────────────────────────────────────

@app.get("/history")
def history(limit: int = 50):
    """
    Returns the last N predictions from the database.
    """
    try:
        return get_recent_predictions(limit=limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/stats")
def stats():
    """
    Returns summary statistics: total predictions, average score, risk breakdown.
    """
    try:
        return get_prediction_stats()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))