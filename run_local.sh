#!/bin/bash

# Run the application locally for testing

# Check if the frontend and backend directories exist
if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    echo "Error: frontend or backend directory not found."
    exit 1
fi

# Start the backend server
echo "Starting backend server..."
(
    cd backend || { echo "Error: Could not change to backend directory"; exit 1; }
    python -m venv venv 2>/dev/null || true
    # Activate virtual environment if it exists
    # shellcheck disable=SC1091
    if [ -f "venv/bin/activate" ]; then
        . "venv/bin/activate"
    fi
    pip install -r requirements.txt
    python main.py &
    BACKEND_PID=$!
    echo "Backend PID: $BACKEND_PID"
)
BACKEND_PID=$(pgrep -f "python main.py")

# Start the frontend server
echo "Starting frontend server..."
(
    cd frontend || { echo "Error: Could not change to frontend directory"; exit 1; }
    npm install
    PORT=3001 npm start &
    FRONTEND_PID=$!
    echo "Frontend PID: $FRONTEND_PID"
)
FRONTEND_PID=$(pgrep -f "react-scripts start")

# Function to handle script termination
cleanup() {
    echo "Stopping servers..."
    kill "$BACKEND_PID" 2>/dev/null
    kill "$FRONTEND_PID" 2>/dev/null
    exit 0
}

# Register the cleanup function for script termination
trap cleanup SIGINT SIGTERM

echo ""
echo "Application is running:"
echo "- Frontend: http://localhost:3001"
echo "- Backend API: http://localhost:8000"
echo "- API Documentation: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop the servers."

# Wait for user to press Ctrl+C
wait
