# FloodWatch SL

FloodWatch SL is an end-to-end MLOps platform that predicts flood-risk scores for Sri Lankan
locations and turns them into operational, decision-ready guidance. It serves the Round 1 champion
model (**V014 CatBoost Alpha Pack seed ensemble**) through a FastAPI backend and a React frontend,
adding a 10-day weather-driven forecast, an AI-generated preparedness briefing, an interactive risk
map, and a live monitoring dashboard.

Built for the **IEEE ML Opsidian: Genesis 2026** competition.

---

## Team

- **Umesh Yapa**
- **Esandu Epa**
- **Shalitha Rathnayake**
- **Lasal Jayasinghe**

IEEE Student Branch, University of Colombo School of Computing (UCSC).

---

## Live deployment

| Service  | URL |
|----------|-----|
| API (Render) | https://floodwatch-sl.onrender.com |
| Frontend (Vercel) | `https://<your-vercel-app>.vercel.app` _(replace with the live Vercel URL)_ |

> Note: the API runs on Render's free tier and **spins down when idle** — the first request after a
> period of inactivity can take 30–50 seconds to wake (cold start). Subsequent requests are fast.

Quick health check: `curl https://floodwatch-sl.onrender.com/health`

---

## System overview

**Stack:** Python · FastAPI · CatBoost · scikit-learn · pandas · React 19 · Vite · Leaflet · recharts
· MLflow · Docker · Render · Vercel.

**Architecture (request flow):**

```
React frontend (Vercel)
        │  HTTPS (axios)
        ▼
FastAPI service (Render, Docker)
  ├─ /predict, /predict/batch ── feature_engineering → data_validation → predict (25-model ensemble) → SQLite log
  ├─ /forecast/{city}[/all]    ── Open-Meteo rainfall → record composition → ensemble → 1-hour cache
  ├─ /forecast/{city}/briefing ── forecast + Google Gemini natural-language briefing (graceful fallback)
  ├─ /stats, /history          ── SQLite prediction log (powers the monitoring dashboard)
  └─ /model-info               ── champion model metadata
```

**The model (V014):** CatBoost regressor **seed ensemble** — 25 models (5 seeds × 5 folds) averaged,
trained on the 35-feature "Alpha Pack" with target-binned StratifiedKFold. Feature engineering
(`src/feature_engineering.py`) builds engineered ratio features plus log1p / quantile-map /
Yeo-Johnson transforms; the fitted transformers are persisted as `.joblib` so inference exactly
mirrors training.

**Features:**
- **Predict** — Expert (all 33 inputs) and Quick (district-default auto-fill) modes.
- **Forecast** — 10-day per-city risk timeline from live Open-Meteo rainfall, with a Gemini briefing.
- **Map** — all 27 cities on an interactive Leaflet map with a 10-day time slider and play animation.
- **Monitoring** — live telemetry (auto-refresh) over prediction stats, history, risk distribution,
  and MLflow experiment tracking.

---

## Project structure

```
api/            FastAPI app (main.py, schemas.py)
src/            prediction library (config, feature_engineering, data_validation,
                predict, forecast, briefing, weather, logger)
models/champion_v014_seed_ensemble/   25 .cbm models + fitted .joblib transformers + metadata
scripts/        fit_transformers.py, log_to_mlflow.py, build_district_defaults.py, test_predict_pipeline.py
data/           processed train/test CSVs, sri_lanka_cities.json, district_defaults.json
frontend/       React + Vite app (pages, components, services)
docs/           round1 summary, MLflow screenshots, phase summaries
Dockerfile      container image used by Render
```

---

## Setup (local)

### Backend
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# one-time: generate fitted transformer artifacts
python scripts/fit_transformers.py

# run the API
uvicorn api.main:app --reload --port 8000
```
API docs: http://localhost:8000/docs

Set `GEMINI_API_KEY` in a local `.env` (git-ignored) to enable the AI briefing:
```
GEMINI_API_KEY=your_key_here
```

### Frontend
```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
```
The frontend reads `VITE_API_URL` (falls back to `http://localhost:8000`). For production builds,
`frontend/.env.production` points to the Render API.

### Smoke test
```bash
python scripts/test_predict_pipeline.py
```

---

## Deployment

**API → Render (Docker web service):**
- Render builds the repo `Dockerfile` (`python:3.11`, installs `api/requirements.txt`, runs
  `scripts/fit_transformers.py` at build, serves `uvicorn api.main:app`).
- Set the `GEMINI_API_KEY` environment variable in the Render service settings.
- Auto-deploys on push to `main`.

**Frontend → Vercel (static build):**
- Build command `npm run build`, output `dist/` (root: `frontend/`).
- Set `VITE_API_URL` to the Render API URL (also committed in `frontend/.env.production`).
- Auto-deploys on push to `main`.

---

## Dependencies

- **Backend (runtime):** `api/requirements.txt` — fastapi, uvicorn, pydantic, catboost, numpy, pandas,
  scikit-learn, joblib, requests, python-dotenv, google-generativeai.
- **Full dev environment:** `requirements.txt` (includes Jupyter, matplotlib, MLflow, etc.).
- **Frontend:** `frontend/package.json` — react, react-dom, react-router-dom, axios, leaflet,
  react-leaflet, recharts, lucide-react (build: vite, eslint).

---

## External services & libraries (Rule 5 disclosure)

| Service / Library | Purpose | Free/Paid | Where used |
|---|---|---|---|
| Render | API hosting (Docker web service) | Free tier | Dockerfile, live API |
| Vercel | Frontend hosting | Free tier | frontend deploy |
| Open-Meteo | 10-day rainfall forecast | Free, no key | `src/weather.py` |
| Google Gemini | NL preparedness briefing | Free tier (quota) | `src/briefing.py` (google-generativeai) |
| OpenStreetMap tiles | Map base tiles | Free | `RiskMap.jsx`, `QuickForm.jsx` (Leaflet) |
| Google Fonts (Inter) | Typography | Free | `frontend/index.html` |
| GitHub | Source hosting + deploy trigger | Free | repository |
| MLflow | Experiment tracking | Free (OSS) | `scripts/log_to_mlflow.py` |
| CatBoost | Gradient-boosting model | Free (OSS) | `src/predict.py`, `models/*.cbm` |
| scikit-learn | Fitted transforms (qmap / Yeo-Johnson) | Free (OSS) | `src/feature_engineering.py` |
| FastAPI / Uvicorn | API framework / server | Free (OSS) | `api/main.py` |
| React / Vite | Frontend framework / build | Free (OSS) | `frontend/` |
| Leaflet / react-leaflet | Map rendering | Free (OSS) | `RiskMap.jsx` |
| recharts | Charts | Free (OSS) | forecast & monitoring charts |
| lucide-react | Icons | Free (OSS) | across pages |
| axios | HTTP client | Free (OSS) | `src/services/api.js` |

No paid APIs, foundation-model fine-tuning, or proprietary services are used.

---

## Round 1 foundation

The system is based on our Round 1 best model — **CatBoost Alpha Pack + drop-missing training rows**,
extended into a seed ensemble (V014). See `docs/round1_results_summary.md` for the full experiment
history and public-score progression.
