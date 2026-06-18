from __future__ import annotations

import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime, timezone

# Grab the secret Postgres URL injected by Render
DATABASE_URL = os.getenv("DATABASE_URL")

def init_db() -> None:
    """
    Creates the predictions table in the Postgres database if it doesn't already exist.
    Called once when the API server starts.
    """
    if not DATABASE_URL:
        print("WARNING: DATABASE_URL is not set. Database will not be initialized.")
        return

    with psycopg2.connect(DATABASE_URL) as conn:
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS predictions (
                    id               SERIAL PRIMARY KEY,
                    timestamp        TEXT    NOT NULL,
                    record_id        TEXT,
                    input_json       TEXT,
                    flood_risk_score REAL    NOT NULL,
                    risk_level       TEXT    NOT NULL,
                    model_version    TEXT    NOT NULL
                )
            """)
        # conn.commit() is automatically handled when the 'with' block exits successfully


def log_prediction(
    record_id: str,
    input_data: dict,
    score: float,
    risk_level: str,
    model_version: str,
) -> None:
    """
    Saves one prediction to the remote database.
    Called every time /predict or /predict/batch is used.
    """
    if not DATABASE_URL:
        return

    with psycopg2.connect(DATABASE_URL) as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO predictions
                    (timestamp, record_id, input_json, flood_risk_score, risk_level, model_version)
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (
                    datetime.now(timezone.utc).isoformat(),  # current time in UTC
                    str(record_id),
                    json.dumps(input_data, default=str),     # converts dict to JSON text
                    float(score),
                    risk_level,
                    model_version,
                ),
            )


def get_recent_predictions(limit: int = 100) -> list[dict]:
    """
    Returns the most recent predictions from the database.
    Used by the GET /history endpoint.
    """
    if not DATABASE_URL:
        return []

    with psycopg2.connect(DATABASE_URL) as conn:
        # RealDictCursor makes the Postgres rows behave exactly like Python dictionaries
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                SELECT id, timestamp, record_id, flood_risk_score, risk_level, model_version
                FROM predictions
                ORDER BY id DESC
                LIMIT %s
                """,
                (limit,),
            )
            return cur.fetchall()


def get_prediction_stats() -> dict:
    """
    Returns summary statistics across all predictions.
    Used by the GET /stats endpoint and monitoring dashboard.
    """
    if not DATABASE_URL:
        return {
            "total_predictions": 0, "avg_score": 0.0, "min_score": 0.0, "max_score": 0.0,
            "risk_breakdown": {"Low": 0, "Moderate": 0, "High": 0, "Critical": 0}
        }

    with psycopg2.connect(DATABASE_URL) as conn:
        with conn.cursor() as cur:
            # We cast the averages to ::numeric so ROUND() works perfectly in Postgres
            cur.execute(
                """
                SELECT
                    COUNT(*)                                           AS total_predictions,
                    ROUND(AVG(flood_risk_score)::numeric, 4)           AS avg_score,
                    ROUND(MIN(flood_risk_score)::numeric, 4)           AS min_score,
                    ROUND(MAX(flood_risk_score)::numeric, 4)           AS max_score,
                    SUM(CASE WHEN risk_level = 'Low'      THEN 1 ELSE 0 END) AS count_low,
                    SUM(CASE WHEN risk_level = 'Moderate' THEN 1 ELSE 0 END) AS count_moderate,
                    SUM(CASE WHEN risk_level = 'High'     THEN 1 ELSE 0 END) AS count_high,
                    SUM(CASE WHEN risk_level = 'Critical' THEN 1 ELSE 0 END) AS count_critical
                FROM predictions
                """
            )
            row = cur.fetchone()

    # We convert Postgres Decimal outputs back to floats to ensure FastAPI can serialize them to JSON
    return {
        "total_predictions": row[0] or 0,
        "avg_score":         float(row[1]) if row[1] is not None else 0.0,
        "min_score":         float(row[2]) if row[2] is not None else 0.0,
        "max_score":         float(row[3]) if row[3] is not None else 0.0,
        "risk_breakdown": {
            "Low":      int(row[4]) if row[4] is not None else 0,
            "Moderate": int(row[5]) if row[5] is not None else 0,
            "High":     int(row[6]) if row[6] is not None else 0,
            "Critical": int(row[7]) if row[7] is not None else 0,
        },
    }