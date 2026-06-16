import joblib
import numpy as np
import pandas as pd

from src.config import MODEL_DIR


# ============================================================
# Preprocessing transforms (the 8 features the form does not send)
# ============================================================

# raw column -> log1p feature name
LOG1P_FEATURES = {
    "rainfall_7d_mm": "rainfall_7d_mm_log1p",
    "monthly_rainfall_mm": "monthly_rainfall_mm_log1p",
    "population_density_per_km2": "population_density_per_km2_log1p",
    "nearest_hospital_km": "nearest_hospital_km_log1p",
    "nearest_evac_km": "nearest_evac_km_log1p",
}

# fitted feature name -> (raw column, joblib filename in MODEL_DIR)
FITTED_FEATURES = {
    "ndvi_qmap": ("ndvi", "transformer_ndvi_qmap.joblib"),
    "ndwi_qmap": ("ndwi", "transformer_ndwi_qmap.joblib"),
    "elevation_m_yeojohnson": ("elevation_m", "transformer_elevation_yeojohnson.joblib"),
}

# Module-level cache so the joblib files are read from disk only once.
_transformers = None


def _load_transformers() -> dict:
    """
    Loads and memoizes the 3 fitted transformers (ndvi_qmap, ndwi_qmap,
    elevation_m_yeojohnson). Loaded lazily so importing this module never
    requires the artifacts to exist; they are only needed when a record is
    actually missing one of the fitted features.
    """
    global _transformers
    if _transformers is None:
        loaded = {}
        for feature, (_raw_col, filename) in FITTED_FEATURES.items():
            path = MODEL_DIR / filename
            if not path.exists():
                raise FileNotFoundError(
                    f"Missing transformer artifact: {path}. "
                    f"Run 'python scripts/fit_transformers.py' to generate it."
                )
            loaded[feature] = joblib.load(path)
        _transformers = loaded
    return _transformers


def _apply_transformer(transformer, values: pd.Series) -> np.ndarray:
    """
    Applies a fitted sklearn transformer to a single column, passing NaN
    rows through unchanged (CatBoost tolerates NaN numerics).
    """
    out = np.full(len(values), np.nan, dtype=float)
    mask = values.notna().to_numpy()
    if mask.any():
        arr = values.to_numpy()[mask].reshape(-1, 1)
        out[mask] = transformer.transform(arr).ravel()
    return out


def add_preprocessing_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Adds the 8 preprocessed features the model expects but a raw form record
    does not include: 5 log1p features and 3 fitted transforms.

    Compute-if-missing: a feature is only computed when its column is absent,
    so dataframes that already carry the precomputed columns (e.g. the
    processed train/test CSVs) are left untouched.
    """
    df = df.copy()

    for raw_col, feature in LOG1P_FEATURES.items():
        if feature not in df.columns and raw_col in df.columns:
            raw = pd.to_numeric(df[raw_col], errors="coerce").clip(lower=0)
            df[feature] = np.log1p(raw)

    needed = {
        feature: (raw_col, fname)
        for feature, (raw_col, fname) in FITTED_FEATURES.items()
        if feature not in df.columns and raw_col in df.columns
    }
    if needed:
        transformers = _load_transformers()
        for feature, (raw_col, _fname) in needed.items():
            raw = pd.to_numeric(df[raw_col], errors="coerce")
            df[feature] = _apply_transformer(transformers[feature], raw)

    return df


def add_alpha_pack_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Adds the exact Alpha Pack engineered features used in the V014 winning model.

    Important:
    Do not change this logic unless you intentionally retrain the model.
    The prediction pipeline must match the training notebook.
    """
    df = df.copy()
    eps = 1e-5

    if "distance_to_river_m_clipped" in df.columns:
        distance = df["distance_to_river_m_clipped"]
    else:
        distance = df["distance_to_river_m"].clip(lower=0)

    if "rainfall_7d_mm_clipped" in df.columns:
        rainfall_7d = df["rainfall_7d_mm_clipped"]
    else:
        rainfall_7d = df["rainfall_7d_mm"].clip(lower=0)

    inundation = df["inundation_area_sqm"].clip(lower=0)

    df["GOLDEN_distance_rainfall_ratio"] = (
        np.log1p(distance) - np.log1p(rainfall_7d + eps)
    )

    df["distance_to_river_DIV_inundation_area"] = (
        distance / (inundation + eps)
    )

    df["distance_to_river_DIV_rainfall_7d"] = (
        distance / (rainfall_7d + eps)
    )

    df["rainfall_7d_MULT_inundation_area"] = (
        rainfall_7d * inundation
    )

    new_cols = [
        "GOLDEN_distance_rainfall_ratio",
        "distance_to_river_DIV_inundation_area",
        "distance_to_river_DIV_rainfall_7d",
        "rainfall_7d_MULT_inundation_area",
    ]

    for col in new_cols:
        df[col] = df[col].replace([np.inf, -np.inf], np.nan)
        df[col] = df[col].fillna(df[col].median())

    # Add the 8 preprocessed features (log1p / qmap / yeojohnson) when missing,
    # so raw form records become model-ready without changing the call site.
    df = add_preprocessing_features(df)

    return df