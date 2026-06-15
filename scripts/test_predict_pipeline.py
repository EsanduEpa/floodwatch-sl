import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[1]
sys.path.append(str(ROOT_DIR))

import pandas as pd

from src.config import SAMPLE_DATA_PATH
from src.predict import predict_batch, load_models, load_model_metadata

def main():
    print("Loading model metadata...")
    metadata = load_model_metadata()
    print("Model version:", metadata.get("model_version"))
    print("Expected number of models:", metadata.get("number_of_models"))

    print("\nLoading models...")
    models = load_models()
    print("Loaded models:", len(models))

    print("\nLoading sample data...")
    df = pd.read_csv(SAMPLE_DATA_PATH)
    df_sample = df.head(10).copy()
    print("Sample shape:", df_sample.shape)

    print("\nGenerating predictions...")
    predictions = predict_batch(df_sample)

    print(predictions)

    print("\nPrediction summary:")
    print(predictions["flood_risk_score"].describe())

    assert len(predictions) == len(df_sample)
    assert predictions["flood_risk_score"].between(0, 1).all()
    assert "risk_level" in predictions.columns
    assert "model_version" in predictions.columns

    print("\nPrediction pipeline working successfully.")


if __name__ == "__main__":
    main()