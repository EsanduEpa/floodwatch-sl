import json
from pathlib import Path

import numpy as np
import pandas as pd
from catboost import CatBoostRegressor

from src.config import (
    MODEL_DIR,
    FEATURE_LIST_PATH,
    CATEGORICAL_FEATURES_PATH,
    MODEL_METADATA_PATH,
    ID_COL,
    PREDICTION_MIN,
    PREDICTION_MAX,
)

from src.feature_engineering import add_alpha_pack_features
from src.data_validation import validate_input_dataframe




def load_json(path: Path):
    """
    Loads a JSON file.
    """
    with open(path, "r") as f:
        return json.load(f)


def load_feature_list() -> list:
    """
    Loads the exact 35 Alpha Pack features used by the V014 model.
    """
    return load_json(FEATURE_LIST_PATH)


def load_categorical_features() -> list:
    """
    Loads categorical features used during CatBoost training.
    """
    return load_json(CATEGORICAL_FEATURES_PATH)


def load_model_metadata() -> dict:
    """
    Loads model metadata such as version, CV scores, and model name.
    """
    return load_json(MODEL_METADATA_PATH)


def get_model_files() -> list:
    """
    Finds all saved CatBoost model files in the champion model folder.
    """
    model_files = sorted(MODEL_DIR.glob("*.cbm"))

    if len(model_files) == 0:
        raise FileNotFoundError(f"No .cbm model files found in {MODEL_DIR}")

    return model_files


def load_models() -> list:
    """
    Loads all saved CatBoost models from the V014 seed ensemble.

    Expected:
    5 seeds x 5 folds = 25 models
    """
    model_files = get_model_files()
    models = []

    for model_path in model_files:
        model = CatBoostRegressor()
        model.load_model(str(model_path))
        models.append(model)

    return models


def get_risk_level(score: float) -> str:
    """
    Converts flood_risk_score into a readable risk level.
    """
    if score < 0.30:
        return "Low"
    elif score < 0.55:
        return "Moderate"
    elif score < 0.75:
        return "High"
    else:
        return "Critical"


def prepare_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Applies the same feature engineering used in V014 training
    and selects the exact 35 Alpha Pack features.
    """
    feature_list = load_feature_list()

    df_fe = add_alpha_pack_features(df)

    validation = validate_input_dataframe(
        df=df_fe,
        required_columns=feature_list,
        id_col=ID_COL,
    )

    if not validation["is_valid"]:
        raise ValueError(f"Input validation failed: {validation['errors']}")

    X = df_fe[feature_list].copy()

    return X


def predict_scores(df: pd.DataFrame, models: list = None) -> np.ndarray:
    """
    Predicts flood risk scores using the full V014 ensemble.

    Steps:
    1. Load 25 CatBoost models
    2. Predict with each model
    3. Average all predictions
    4. Clip prediction between 0 and 1
    """
    if models is None:
        models = load_models()

    X = prepare_features(df)

    all_predictions = []

    for model in models:
        preds = model.predict(X)
        all_predictions.append(preds)

    ensemble_preds = np.mean(all_predictions, axis=0)
    ensemble_preds = np.clip(ensemble_preds, PREDICTION_MIN, PREDICTION_MAX)

    return ensemble_preds


def predict_batch(df: pd.DataFrame, models=None) -> pd.DataFrame:
    """
    Full batch prediction pipeline.

    Input:
    Raw dataframe with the original columns.

    Output:
    record_id, flood_risk_score, risk_level, model_version
    """
    metadata = load_model_metadata()
    preds = predict_scores(df, models=models)

    if ID_COL in df.columns:
        ids = df[ID_COL].values
    else:
        ids = np.arange(len(df))

    result = pd.DataFrame({
        ID_COL: ids,
        "flood_risk_score": preds,
        "risk_level": [get_risk_level(score) for score in preds],
        "model_version": metadata.get("model_version", "champion_v014_seed_ensemble"),
    })

    return result