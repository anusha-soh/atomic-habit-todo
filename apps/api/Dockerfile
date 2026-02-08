# Dockerfile for Hugging Face Spaces deployment (free tier)
# Runs FastAPI backend on port 7860 (HF Spaces default)

FROM python:3.13-slim

# Set working directory
WORKDIR /app

# Install system dependencies for psycopg2
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc libpq-dev && \
    rm -rf /var/lib/apt/lists/*

# Copy dependency files first for layer caching
COPY pyproject.toml ./

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir .

# Copy application code
COPY src/ ./src/
COPY alembic/ ./alembic/
COPY alembic.ini ./

# Create logs directory
RUN mkdir -p logs

# Create non-root user for HF Spaces security requirement
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app
USER appuser

# Expose port 7860 (Hugging Face Spaces default)
EXPOSE 7860

# Run database migrations then start the application
CMD ["sh", "-c", "python -m alembic upgrade head 2>/dev/null || true && uvicorn src.main:app --host 0.0.0.0 --port 7860"]
