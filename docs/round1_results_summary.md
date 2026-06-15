# Round 1 Results Summary – ML Opsidian: Genesis

## Problem
- Task: Predict `flood_risk_score` for Sri Lankan locations.
- Type: Regression.
- Target range: 0 to 1.
- Submission columns: `record_id`, `flood_risk_score`.
- Evaluation: Hidden custom metric. Lower score is better. The metric appeared to reward both low error and non-flat prediction variance.

## Best Round 1 Direction
The strongest confirmed public-score improvement came from:

1. CatBoost model.
2. Drop rows with original missing values from train only.
3. Keep all test rows.
4. Use the 35-feature Alpha Pack feature set.
5. Use target-binned StratifiedKFold for local validation.
6. Use Alpha Pack engineered features:
   - `GOLDEN_distance_rainfall_ratio`
   - `distance_to_river_DIV_inundation_area`
   - `distance_to_river_DIV_rainfall_7d`
   - `rainfall_7d_MULT_inundation_area`

## Public Submission Scores

| Version | Model / Dataset | Public Score | Notes |
|---|---|---:|---|
| V001 | Mean baseline | 0.40699 | Baseline reference |
| V003 | Ridge alpha 50000 | 0.39630 | Best linear model |
| V006 | CatBoost baseline | 0.38368 | First strong model |
| V008 | CatBoost Alpha Pack | 0.38308 | 35 selected + engineered features |
| V010 | CatBoost Alpha Pack + drop-missing rows | **0.38176** | Best confirmed public submission |
| V011 | CatBoost Alpha Pack + drop-missing + invalid rows | 0.38309 | Strict invalid removal hurt score |
| V014 | CatBoost Alpha Pack + drop-missing seed ensemble | Local best | Submission score not recorded in this file. But it was the winning submission |

## Important Lessons

### What worked
- CatBoost handled categorical geographic features well.
- Dropping original missing-value training rows improved the public score.
- The 35-feature Alpha Pack outperformed the full feature set.
- Target-binned validation helped keep validation balanced across low, medium, and high risk values.
- Seed ensembling improved local CV compared with the single CatBoost model.

### What did not work
- Ridge was weaker than CatBoost.
- Strict invalid-row removal worsened public score.
- Adding all features back as Full + Alpha hurt local performance.
- Correlation-guided extra features did not beat the original 35 Alpha Pack setup.
- Conservative shrinkage was not the main path because predictions were already relatively flat.

## Data Files Added for Final Round Repository
- `data/raw/train_dropmissing.csv` – train rows with original missing values removed.
- `data/raw/test_dropmissing.csv` – test set copied unchanged because every test row needs a prediction.
- `notebooks/01_round1_reproduction.ipynb` – reproduction notebook for the Round 1 best pipeline.
- `submission_tracker.csv` – submission and score tracker.
