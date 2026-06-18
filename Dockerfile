# ==========================================
# STAGE 1: The Builder (The Heavy Kitchen)
# ==========================================
FROM python:3.11 AS builder

WORKDIR /workspace

# Install system compilation tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install them into a localized folder (/install)
COPY ./api/requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt


# ==========================================
# STAGE 2: The Runner (The Clean Dining Table)
# ==========================================
FROM python:3.11-slim AS runner

WORKDIR /workspace

# Set the Python path so scripts can find module definitions
ENV PYTHONPATH=/workspace

# Copy ONLY the pre-installed Python packages from the builder stage
COPY --from=builder /install /usr/local

# Copy your clean application folders
COPY api/ ./api/
COPY src/ ./src/
COPY models/ ./models/
COPY scripts/ ./scripts/
COPY data/ ./data/

# Execute the transformer setup script
RUN cd /workspace && python scripts/fit_transformers.py

EXPOSE 10000

CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "10000"]