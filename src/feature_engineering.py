import numpy as np
import pandas as pd


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

    return df