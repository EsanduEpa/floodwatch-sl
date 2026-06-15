import pandas as pd


def validate_input_dataframe(
    df: pd.DataFrame,
    required_columns: list,
    id_col: str = "record_id",
) -> dict:
    """
    Validates input data before prediction.

    Returns a dictionary with:
    - is_valid: True/False
    - errors: serious problems that stop prediction
    - warnings: problems that should be shown but do not stop prediction
    """
    errors = []
    warnings = []

    if df is None:
        errors.append("Input dataframe is None.")
        return {
            "is_valid": False,
            "errors": errors,
            "warnings": warnings,
        }

    if df.empty:
        errors.append("Input dataframe is empty.")

    missing_columns = [col for col in required_columns if col not in df.columns]
    if missing_columns:
        errors.append(f"Missing required columns: {missing_columns}")

    if id_col in df.columns:
        duplicate_count = df[id_col].duplicated().sum()
        if duplicate_count > 0:
            warnings.append(f"Duplicate {id_col} values found: {duplicate_count}")
    else:
        warnings.append(f"{id_col} column not found. Row index will be used if needed.")

    total_missing = int(df.isnull().sum().sum())
    if total_missing > 0:
        warnings.append(f"Total missing values found: {total_missing}")

    if "latitude" in df.columns:
        invalid_lat = (~df["latitude"].between(-90, 90)).sum()
        if invalid_lat > 0:
            warnings.append(f"Invalid latitude values found: {int(invalid_lat)}")

    if "longitude" in df.columns:
        invalid_lon = (~df["longitude"].between(-180, 180)).sum()
        if invalid_lon > 0:
            warnings.append(f"Invalid longitude values found: {int(invalid_lon)}")

    return {
        "is_valid": len(errors) == 0,
        "errors": errors,
        "warnings": warnings,
    }