#!/bin/bash
# CineScope Setup & Run Script

echo "🎬 CineScope Movie Analytics Platform"
echo "======================================"

# Check if movies_dataset.csv exists
if [ ! -f "movies_dataset.csv" ]; then
  echo "⚠️  movies_dataset.csv not found in current directory."
  echo "   Place your CSV file here: $(pwd)/movies_dataset.csv"
  echo "   The app will generate sample data if the file is missing."
fi

# ── Backend Setup ──────────────────────────────────────────────────────────
echo ""
echo "📦 Setting up Python backend..."
cd backend

# Create virtual environment if not exists
if [ ! -d "venv" ]; then
  python3 -m venv venv
fi

source venv/bin/activate 2>/dev/null || source venv/Scripts/activate 2>/dev/null
pip install -r requirements.txt -q

# Copy CSV to backend if present
if [ -f "../movies_dataset.csv" ]; then
  cp ../movies_dataset.csv .
  echo "✅ Dataset copied to backend/"
fi

# Start backend in background
echo "🚀 Starting FastAPI backend on http://localhost:8000..."
uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
cd ..

# ── Frontend Setup ─────────────────────────────────────────────────────────
echo ""
echo "📦 Setting up React frontend..."
cd frontend

if [ ! -d "node_modules" ]; then
  echo "Installing npm packages..."
  npm install
fi

echo "🚀 Starting React dev server on http://localhost:3000..."
npm run dev &
FRONTEND_PID=$!
cd ..

# ── Done ──────────────────────────────────────────────────────────────────
echo ""
echo "======================================"
echo "✅ CineScope is running!"
echo ""
echo "   Frontend:  http://localhost:3000"
echo "   Backend:   http://localhost:8000"
echo "   API Docs:  http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services."
echo "======================================"

# Wait and cleanup on exit
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Stopped.'" EXIT
wait
