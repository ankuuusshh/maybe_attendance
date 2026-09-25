#!/bin/bash
# SmartPresence — Start the Python AI Service
# Run from the project root: maybe_attendance/

AI_DIR="$(cd "$(dirname "$0")" && pwd)/ai-service"
VENV_DIR="$(cd "$(dirname "$0")" && pwd)/scratch_venv"

echo "🤖 Starting SmartPresence AI Service (FastAPI + face_recognition)"
echo "   Port: 8000"
echo "   VENV: $VENV_DIR"
echo ""

source "$VENV_DIR/bin/activate"
cd "$AI_DIR"
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
