"""
Build per-district default values from training data.

For each Sri Lankan district, compute the average (numeric) or most common
(categorical) value of every feature. Saved as data/district_defaults.json.

Used by the /forecast endpoint to fill in static features for any city.

Run once:  python scripts/build_district_defaults.py
"""

from __future__ import annotations

import json
from pathlib import Path

import pandas as pd

# ── Project paths ────────────────────────────────────────────────────────────
ROOT       = Path(__file__).resolve().parent.parent
TRAIN_CSV  = ROOT / "data" / "processed" / "train_dropmissing.csv"
OUTPUT     = ROOT / "data" / "district_defaults.json"


# ─────────────────────────────────────────────────────────────────────────────
# Categorical detection — auto-detect any text column instead of hardcoding
# ─────────────────────────────────────────────────────────────────────────────
def is_categorical(series: pd.Series) -> bool:
    return series.dtype == "object" or series.dtype.name == "category"


# ── Columns we do NOT want to put in defaults ────────────────────────────────
# These are runtime values (the user/weather API provides them).
# Or they are bookkeeping columns (record_id, target, dates).
SKIP_COLS = [
    "record_id",
    "flood_risk_score",     # target — we predict this, don't default it
    "district",             # the key itself
    "place_name",           # user provides
    "latitude",             # comes from city lookup
    "longitude",            # comes from city lookup
    "rainfall_7d_mm",       # provided by weather API
    "monthly_rainfall_mm",  # provided by weather API
    "generation_date",      # bookkeeping
    "is_synthetic",         # bookkeeping
    # log1p / qmap / yeojohnson versions are recomputed by feature engineering
    "rainfall_7d_mm_log1p",
    "monthly_rainfall_mm_log1p",
    "population_density_per_km2_log1p",
    "nearest_hospital_km_log1p",
    "nearest_evac_km_log1p",
    "distance_to_river_m_log1p",
    "ndvi_qmap",
    "ndwi_qmap",
    "elevation_m_yeojohnson",
    "drainage_index_yeojohnson",
    "built_up_percent_qmap",
    # date breakdowns — irrelevant at forecast time
    "generation_year",
    "generation_month",
    "generation_day",
    "generation_dayofyear",
    "generation_quarter",
    "generation_date_missing",
    # invalid/clipped flags — recomputed at runtime
    "distance_to_river_m_invalid_flag",
    "distance_to_river_m_clipped",
    "rainfall_7d_mm_invalid_flag",
    "rainfall_7d_mm_clipped",
    "monthly_rainfall_mm_invalid_flag",
    "monthly_rainfall_mm_clipped",
    "built_up_percent_invalid_flag",
    "built_up_percent_clipped",
    "drainage_index_invalid_flag",
    "drainage_index_clipped",
    "ndvi_invalid_flag",
    "ndvi_clipped",
    "ndwi_invalid_flag",
    "ndwi_clipped",
    "elevation_m_invalid_flag",
    "elevation_m_clipped",
]


def compute_district_defaults(df: pd.DataFrame) -> dict:
    """
    For each district, compute the typical value of every relevant feature.
    Numeric features → mean.
    Categorical (text) features → mode (most common value).
    """
    feature_cols = [c for c in df.columns if c not in SKIP_COLS]
    grouped      = df.groupby("district")
    defaults     = {}

    for district, group in grouped:
        district_values = {}

        for col in feature_cols:
            if is_categorical(df[col]):
                # Most common value — fallback to None if all NaN
                mode_series = group[col].mode(dropna=True)
                district_values[col] = (
                    str(mode_series.iloc[0]) if len(mode_series) > 0 else None
                )
            else:
                # Numeric average — round to 4 decimals for readability
                mean_value = group[col].mean()
                district_values[col] = (
                    round(float(mean_value), 4) if pd.notna(mean_value) else None
                )

        defaults[district] = district_values

    return defaults


def main() -> None:
    print(f"Reading training data from: {TRAIN_CSV}")
    df = pd.read_csv(TRAIN_CSV)
    print(f"  Loaded {len(df):,} rows with {len(df.columns)} columns")

    districts = sorted(df["district"].unique())
    print(f"  Found {len(districts)} unique districts: {districts}")

    print("\nComputing per-district defaults...")
    defaults = compute_district_defaults(df)

    # Show one example so we can sanity-check
    sample_district = list(defaults.keys())[0]
    sample_features = list(defaults[sample_district].keys())
    print(f"\nExample — {sample_district} has {len(sample_features)} default features:")
    for key in list(sample_features)[:5]:
        print(f"  {key}: {defaults[sample_district][key]}")
    print(f"  ... and {len(sample_features) - 5} more")

    OUTPUT.write_text(json.dumps(defaults, indent=2))
    print(f"\nSaved district defaults to: {OUTPUT}")


if __name__ == "__main__":
    main()