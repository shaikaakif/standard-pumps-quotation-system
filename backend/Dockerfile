# Use official lightweight Python image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

# Install system dependencies required by WeasyPrint for PDF generation
# and clean up cache to keep image small.
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpango-1.0-0 \
    libpangoft2-1.0-0 \
    libharfbuzz-subset0 \
    libjpeg-dev \
    libopenjp2-7-dev \
    libffi-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy python dependencies
COPY requirements.txt .

# Install python dependencies
RUN pip install --no-cache-dir -r requirements.txt
# Copy backend source code into the container
COPY . .

# Create a data directory for SQLite persistence (overridden by Render disk)
RUN mkdir -p /data

# Expose port (Render sets PORT env variable dynamically)
EXPOSE 8000

# Start Uvicorn safely binding to 0.0.0.0
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "10000"]