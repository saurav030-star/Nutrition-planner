#!/usr/bin/env bash

# ==============================================================================
# Enterprise-Grade AI Nutrition Planner (FoodTech Sector Automation)
# One-Click Local Startup Script
# Researchers: Saurav Sharma (251810700281) & Nitish Kumar (251810700125)
# Year & Section: B.Tech CSE (AI/ML) 2025–2029
# ==============================================================================

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

echo "================================================================================"
echo "🚀 STARTING ENTERPRISE-GRADE AI NUTRITION PLANNER"
echo "================================================================================"

# 1. Activate Python virtual environment
if [ -d ".venv" ]; then
    echo "📦 Activating Python virtual environment..."
    source .venv/bin/activate
else
    echo "⚠️ .venv not found, creating virtual environment..."
    python3 -m venv .venv
    source .venv/bin/activate
    pip install -r backend/requirements.txt
fi

# 2. Start FastAPI Backend in background
echo "⚡ Starting FastAPI Backend Server on http://127.0.0.1:8000..."
export PYTHONPATH="$DIR/backend:$PYTHONPATH"
python -m uvicorn app.main:app --app-dir "$DIR/backend" --host 127.0.0.1 --port 8000 --reload &
BACKEND_PID=$!

cleanup() {
    echo ""
    echo "🛑 Shutting down servers (PID: $BACKEND_PID)..."
    kill $BACKEND_PID 2>/dev/null || true
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# Give backend a moment to spin up
sleep 2

# Verify backend health
curl -s http://127.0.0.1:8000/health > /dev/null && echo "✅ Backend API healthy: http://127.0.0.1:8000" || echo "⚠️ Backend starting up..."

# 3. Start Next.js Frontend
echo "🌐 Starting Next.js Frontend on http://localhost:3000..."
cd "$DIR/frontend"
npm run dev
