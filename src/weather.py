"""
Weather forecast integration for FloodWatch SL.

Uses the Open-Meteo API (free, no key required) to fetch daily rainfall
forecasts for any latitude/longitude. Used by the /forecast endpoint to
build hypothetical 10-day prediction inputs.

Documentation: https://open-meteo.com/en/docs
"""

from __future__ import annotations

import requests

# ── Open-Meteo configuration ─────────────────────────────────────────────────
OPEN_METEO_BASE_URL = "https://api.open-meteo.com/v1/forecast"
SRI_LANKA_TIMEZONE  = "Asia/Colombo"
DEFAULT_FORECAST_DAYS = 10
REQUEST_TIMEOUT_SEC  = 10


def get_forecast(
    latitude: float,
    longitude: float,
    forecast_days: int = DEFAULT_FORECAST_DAYS,
) -> list[dict]:
    """
    Fetch a daily rainfall forecast for the given coordinates.

    Args:
        latitude:      decimal degrees, -90 to 90
        longitude:     decimal degrees, -180 to 180
        forecast_days: how many days ahead (default 10, max 16)

    Returns:
        A list of dicts, one per day, like:
        [
          {"date": "2026-06-17", "rainfall_mm": 12.4},
          {"date": "2026-06-18", "rainfall_mm": 0.0},
          ...
        ]

    Raises:
        requests.RequestException if the API call fails.
        ValueError if the response is malformed.
    """
    # ── Build request parameters ──
    params = {
        "latitude":      latitude,
        "longitude":     longitude,
        "daily":         "precipitation_sum",
        "timezone":      SRI_LANKA_TIMEZONE,
        "forecast_days": forecast_days,
    }

    # ── Make the API call ──
    response = requests.get(
        OPEN_METEO_BASE_URL,
        params=params,
        timeout=REQUEST_TIMEOUT_SEC,
    )
    response.raise_for_status()  # raises an error if HTTP status is 4xx/5xx

    data = response.json()

    # ── Validate the response shape ──
    daily = data.get("daily", {})
    dates    = daily.get("time")
    rainfall = daily.get("precipitation_sum")

    if not dates or not rainfall:
        raise ValueError(
            f"Open-Meteo response missing expected fields. Got: {list(daily.keys())}"
        )

    if len(dates) != len(rainfall):
        raise ValueError(
            f"Open-Meteo returned mismatched array lengths: "
            f"{len(dates)} dates vs {len(rainfall)} rainfall values"
        )

    # ── Combine into list of daily forecasts ──
    forecast = []
    for date_str, rain_mm in zip(dates, rainfall):
        forecast.append({
            "date":        date_str,
            "rainfall_mm": float(rain_mm) if rain_mm is not None else 0.0,
        })

    return forecast


def get_rolling_7day_rainfall(forecast: list[dict]) -> list[float]:
    """
    Convert a list of daily rainfall values into a rolling 7-day sum.

    Our model takes 'rainfall_7d_mm' as input — the total rainfall over the
    past 7 days. For each day in the forecast, we need the 7-day rolling
    total ending on that day.

    For early forecast days where 7 days of forecast aren't available yet,
    we use only the days we have (treats prior days as zero rainfall).

    Example:
        Input:  [10, 0, 5, 0, 0, 20, 5, 10, 0, 0]   (10 days)
        Output: [10, 10, 15, 15, 15, 35, 40, 40, 30, 35]
    """
    rainfall_values = [day["rainfall_mm"] for day in forecast]
    rolling = []

    for i in range(len(rainfall_values)):
        # Sum the last 7 days INCLUDING the current day
        window_start = max(0, i - 6)
        window       = rainfall_values[window_start : i + 1]
        rolling.append(round(sum(window), 2))

    return rolling