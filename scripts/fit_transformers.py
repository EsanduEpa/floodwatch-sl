"""
One-time fitting of the 3 fitted preprocessing transformers used by the V014 model.

The original Round-1 transformers were not saved in this repo, so we refit them on
the training data (data/processed/train_dropmissing.csv) and persist them as joblib
artifacts inside the champion model folder. The prediction pipeline
(src/feature_engineering.py) loads these to turn raw form records into model-ready
features.

Run once (re-run only if retraining):
    python scripts/fit_transformers.py
"""

import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[1]
sys.path.append(str(ROOT_DIR))

import joblib
import pandas as pd
from sklearn.preprocessing import PowerTransformer, QuantileTransformer

from src.config import MODEL_DIR

TRAIN_DATA_PATH = ROOT_DIR / "data" / "processed" / "train_dropmissing.csv"

# raw column -> (output joblib filename, transformer factory)
QMAP_COLUMNS = {
    "ndvi": "transformer_ndvi_qmap.joblib",
    "ndwi": "transformer_ndwi_qmap.joblib",
}
YEOJOHNSON_COLUMNS = {
    "elevation_m": "transformer_elevation_yeojohnson.joblib",
}


def fit_quantile(values: pd.Series) -> QuantileTransformer:
    clean = values.dropna().to_numpy().reshape(-1, 1)
    n_quantiles = min(1000, len(clean))
    transformer = QuantileTransformer(
        output_distribution="normal",
        n_quantiles=n_quantiles,
        random_state=42,
    )
    transformer.fit(clean)
    return transformer


def fit_yeojohnson(values: pd.Series) -> PowerTransformer:
    clean = values.dropna().to_numpy().reshape(-1, 1)
    transformer = PowerTransformer(method="yeo-johnson")
    transformer.fit(clean)
    return transformer


def main():
    print(f"Reading training data: {TRAIN_DATA_PATH}")
    df = pd.read_csv(TRAIN_DATA_PATH)
    print(f"Rows: {len(df)}")

    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    for raw_col, filename in QMAP_COLUMNS.items():
        transformer = fit_quantile(df[raw_col])
        out_path = MODEL_DIR / filename
        joblib.dump(transformer, out_path)
        print(f"  fit QuantileTransformer on '{raw_col}' -> {out_path.name}")

    for raw_col, filename in YEOJOHNSON_COLUMNS.items():
        transformer = fit_yeojohnson(df[raw_col])
        out_path = MODEL_DIR / filename
        joblib.dump(transformer, out_path)
        print(f"  fit PowerTransformer(yeo-johnson) on '{raw_col}' -> {out_path.name}")

    print("\nDone. 3 transformer artifacts written to:")
    print(f"  {MODEL_DIR}")


if __name__ == "__main__":
    main()
