#!/bin/bash
set -e

echo "Starting NutriGraph AI production deployment..."

# Start FastAPI backend in background on 127.0.0.1:8000
echo "Starting FastAPI backend server on 127.0.0.1:8000..."
cd /app
PYTHONPATH=/app/backend python3 -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

# Wait for FastAPI health endpoint
echo "Waiting for backend API to be healthy..."
for i in {1..30}; do
  if curl -s http://127.0.0.1:8000/health > /dev/null 2>&1; then
    echo "Backend API is up and healthy!"
    break
  fi
  sleep 1
done

# Start Next.js frontend on public port (Render uses $PORT, defaults to 10000)
echo "Starting Next.js frontend on port ${PORT:-10000}..."
cd /app/frontend
exec npm run start
