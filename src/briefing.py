"""
Gemini-powered disaster-preparedness briefing for FloodWatch SL.

Takes the output of src.forecast.generate_forecast() and asks Gemini to produce
a structured, action-oriented briefing for a field officer / government planner.
The GEMINI_API_KEY is read from the environment and is never logged or printed.
"""

from __future__ import annotations

import json
import os

import google.generativeai as genai
from dotenv import load_dotenv

from src.config import ROOT_DIR

# Primary model, with a widely-available fallback.
# Note: gemini-2.0-flash-exp / gemini-1.5-flash are retired for current API keys;
# gemini-2.0-flash is the GA successor (same "fast & cheap flash" tier).
GEMINI_MODEL = "gemini-2.0-flash"
FALLBACK_MODEL = "gemini-flash-latest"

_REQUIRED_KEYS = ("executive_summary", "per_day_actions", "overall_recommendation")
_ACTION_KEYS = ("date", "risk_level", "action")


def _configure() -> None:
    """Load the API key from .env and configure the Gemini client. Never logs the key."""
    load_dotenv(ROOT_DIR / ".env")
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not set in the environment.")
    genai.configure(api_key=api_key)


def _build_prompt(forecast_data: dict) -> str:
    """Build the disaster-analyst prompt from a generate_forecast() result."""
    city = forecast_data["city"]
    district = forecast_data["district"]
    summary = forecast_data["summary"]

    timeline = "\n".join(
        f"- {d['date']}: {d['risk_level']} (score {d['flood_risk_score']}); "
        f"rainfall {d['rainfall_mm']} mm; 7-day total {d['rainfall_7d_mm']} mm"
        for d in forecast_data["forecast"]
    )

    return f"""You are a disaster preparedness analyst for Sri Lanka's Disaster Management Centre.
Your audience is a field officer / government planner who needs clear, action-oriented
guidance in plain English. Avoid technical jargon and never mention model internals.

Here is a 10-day flood-risk forecast for {city}, in the {district} district.
Each day lists the model's flood risk level and score (0-1), the forecast daily
rainfall, and the rolling 7-day rainfall total.

Forecast timeline:
{timeline}

Summary: peak risk is {summary['max_risk_level']} on {summary['peak_day']}; \
average score {summary['avg_score']}.

Produce a disaster preparedness briefing. Respond with a SINGLE JSON object ONLY —
no markdown, no code fences, no text before or after the JSON.

Required JSON shape (exact keys):
{{
  "executive_summary": "2-3 plain-English sentences on the 10-day outlook and the most critical day(s).",
  "per_day_actions": [
    {{"date": "YYYY-MM-DD", "risk_level": "<that day's risk level>",
      "action": "ONE sentence beginning with a concrete verb (Monitor / Inspect / Prepare / Deploy / Evacuate)."}}
  ],
  "overall_recommendation": "1-2 sentence recommendation for the whole period."
}}

Rules:
- per_day_actions must contain exactly one entry for EACH forecast day above, in date order,
  reusing the same dates and risk levels.
- Every action is a single sentence starting with one of: Monitor, Inspect, Prepare, Deploy, Evacuate.
- Higher risk days warrant stronger actions (Deploy/Evacuate); low risk days warrant Monitor/Inspect.
- Output valid JSON only."""


def _parse_briefing(text: str) -> dict:
    """Extract and validate the JSON briefing from Gemini's raw text response."""
    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1:
        raise ValueError("Gemini response did not contain a JSON object.")

    data = json.loads(text[start : end + 1])

    for key in _REQUIRED_KEYS:
        if key not in data:
            raise ValueError(f"Gemini briefing missing required key: {key}")
    if not isinstance(data["per_day_actions"], list):
        raise ValueError("per_day_actions must be a list.")
    for action in data["per_day_actions"]:
        for key in _ACTION_KEYS:
            if key not in action:
                raise ValueError(f"per_day_actions entry missing key: {key}")

    # Return only the validated, expected keys.
    return {
        "executive_summary": data["executive_summary"],
        "per_day_actions": [
            {"date": a["date"], "risk_level": a["risk_level"], "action": a["action"]}
            for a in data["per_day_actions"]
        ],
        "overall_recommendation": data["overall_recommendation"],
    }


def generate_briefing(forecast_data: dict) -> dict:
    """
    Generate a structured disaster-preparedness briefing for a forecast.

    Returns a dict with executive_summary, per_day_actions, and
    overall_recommendation. Raises on any Gemini/parse failure so the caller
    can degrade gracefully.
    """
    _configure()
    prompt = _build_prompt(forecast_data)

    last_error: Exception | None = None
    for model_name in (GEMINI_MODEL, FALLBACK_MODEL):
        try:
            model = genai.GenerativeModel(model_name)
            response = model.generate_content(prompt)
            briefing = _parse_briefing(response.text)
            print(f"[briefing] generated using {model_name}")
            return briefing
        except Exception as e:  # noqa: BLE001 - report cause, try fallback
            last_error = e
            print(f"[briefing] model {model_name} failed: {type(e).__name__}")

    raise RuntimeError(f"Gemini briefing generation failed: {last_error}")
