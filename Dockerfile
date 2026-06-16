# Step 1: Use a reliable, optimized Python base image
FROM python:3.11-slim

# Step 2: Establish the working environment inside the container
WORKDIR /workspace

# Step 3: Install underlying OS dependencies required for CatBoost C-bindings 
# and clean up cache to minimize image size
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Step 4: Copy the dependencies file first to leverage Docker layer caching
COPY requirements.txt .

# Step 5: Install Python libraries
RUN pip install --no-cache-dir -r requirements.txt

# Step 6: Copy the modular components of your system into the container
COPY api/ ./api/
COPY src/ ./src/
COPY models/ ./models/
COPY scripts/ ./scripts/

# Step 7: Create the data directory so SQLite has a valid path to write predictions.db
RUN mkdir -p data

# Step 8: Execute the one-time artifact script to generate the .joblib transformers
RUN python scripts/fit_transformers.py

# Step 9: Make the workspace accessible to Python's module path resolution
ENV PYTHONPATH=/workspace

# Step 10: Expose Render's standard web service port
EXPOSE 10000

# Step 11: Spin up the server using uvicorn, routing to main.py inside the api directory
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "10000"]
