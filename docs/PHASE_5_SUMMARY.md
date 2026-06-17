# Phase 5 Summary — 10-Day Flood Forecast Feature

Reference for the technical PDF and presentation slides.

## What was built

A **10-day flood-risk forecast** capability spanning backend and frontend, on top of the existing
V014 CatBoost ensemble.

**Backend (FastAPI)**
- `src/forecast.py` — `generate_forecast(city, models)`: looks up a city, loads that district's
  static feature averages, pulls a 10-day rainfall forecast from Open-Meteo, computes rolling
  7-day rainfall, builds 10 model-ready records, scores them with the existing ensemble
  (`predict_batch`), logs each prediction, and returns a per-day timeline + summary. Cached city /
  district loaders (`@lru_cache`); also `list_available_cities()`.
- `src/briefing.py` — `generate_briefing(forecast_data)`: sends the forecast to Google Gemini as a
  Sri Lankan disaster-preparedness analyst and returns a structured JSON briefing
  (`executive_summary`, `per_day_actions[]`, `overall_recommendation`). Primary model
  `gemini-2.0-flash`, fallback `gemini-flash-latest` (the originally-requested `gemini-2.0-flash-exp`
  / `gemini-1.5-flash` are retired for current keys). The `GEMINI_API_KEY` is read from `.env` and
  never logged.
- New endpoints in `api/main.py`:
  - `GET /cities` → 27 Sri Lankan cities
  - `GET /forecast/{city}` → scored 10-day forecast
  - `GET /forecast/{city}/briefing` → forecast **+** Gemini briefing; on Gemini failure it returns the
    forecast with `briefing: null` and `briefing_error` set (graceful degradation — never fails the request)
- Pydantic schemas added to `api/schemas.py`: `City`, `CitiesResponse`, `ForecastDay`,
  `ForecastSummary`, `ForecastResponse`, `BriefingDayAction`, `BriefingResponse`,
  `ForecastBriefingResponse`.

**Frontend (React 19 + Vite, CSS Modules)**
- New `/forecast` page (`src/pages/Forecast.jsx`): city picker + "Generate Forecast", loading state
  (dark spinner + 8s cold-start hint), error state with Retry, and an empty state with an "About this
  forecast" explainer.
- Result dashboard: **Executive Summary** card, **4 summary chips** (Peak Risk, Max Score, Avg Score,
  and a calculated **Risk Trend** Rising/Falling/Stable), a **recharts** dual-axis **timeline chart**
  (risk score line + risk-colored dots + rainfall bars + 0.30/0.55/0.75 reference lines + compact
  tooltip), a **10-card day-by-day action grid** (responsive 5/3/1 columns), and a navy **Strategic
  Recommendation** card.
- "Forecast" link added to the Navbar.

## External services added (Rule 5 disclosure)

| Service | Use | Key required | Notes |
|---|---|---|---|
| **Open-Meteo** (api.open-meteo.com) | 10-day daily rainfall forecast by lat/lng | No | Free weather API |
| **Google Gemini** (`google-generativeai`) | Natural-language preparedness briefing | Yes (`GEMINI_API_KEY`) | `gemini-2.0-flash` → `gemini-flash-latest` fallback; free tier has a daily quota |
| **puppeteer-core** | Capturing the docs screenshots | — | **Dev-only**, installed `--no-save` (not in `package.json`); not a runtime dependency |

New Python deps (added to `requirements.txt` and `api/requirements.txt`): `requests`,
`python-dotenv`, `google-generativeai`.

## Files created / modified

**Created**
- Backend: `src/forecast.py`, `src/briefing.py`
- Frontend: `src/pages/Forecast.jsx` (+ `.module.css`), `src/components/ForecastChart.jsx`
  (+ `.module.css`), `src/components/DayCard.jsx` (+ `.module.css`), `src/components/SummaryStats.jsx`
  (+ `.module.css`)
- Docs: `docs/screenshots/`, this file

**Modified**
- Backend: `api/main.py` (3 endpoints), `api/schemas.py` (8 schemas), `requirements.txt`,
  `api/requirements.txt`
- Frontend: `src/App.jsx` (route), `src/components/Navbar.jsx` (+ `.module.css`) (link),
  `src/components/LoadingSpinner.jsx` (+ `.module.css`) (non-breaking `variant="dark"`),
  `src/components/ErrorAlert.jsx` (+ `.module.css`) (optional `onRetry` Retry button)

**Pre-built / provided (not authored in Phase 5):** `src/weather.py` (Open-Meteo client),
`data/sri_lanka_cities.json`, `data/district_defaults.json`.

## Known limitations

- **Model prediction range is naturally narrow.** The V014 ensemble has low R² (~0.04) and outputs
  scores in roughly **0.39–0.60**, so forecasts almost always read **Moderate** (occasionally High);
  Low/Critical are effectively unreachable. The UI conveys relative day-to-day and city-to-city
  movement correctly, but the model is not strongly discriminative. Improving this requires
  retraining, not frontend work.
- **District-level averages.** Quick-forecast inputs use per-district environmental averages, not
  block-level data, so two locations in the same district share the same non-rainfall features.
  Higher-resolution geospatial data is on the future-improvements roadmap.
- **Gemini free-tier quota.** Heavy testing can exhaust the daily request quota (HTTP 429). The
  endpoint degrades gracefully (forecast still returns, `briefing_error` set, UI shows an
  "AI briefing temporarily unavailable" notice). A billed key removes the limit.

## Screenshots (`docs/screenshots/`)

- `forecast-empty-state.png` — city picker + "About this forecast" explainer. ✅ saved
- `forecast-briefing-error.png` — graceful degradation: chips + chart + day cards render, briefing
  hidden, warning shown. ✅ saved
- `forecast-populated.png` — fully populated forecast **with** a live Gemini briefing.
  ⏳ **pending** a fresh `GEMINI_API_KEY` (daily quota was exhausted during testing). A fabricated
  briefing was deliberately **not** used for this capture — only a real Gemini response will be shown.
