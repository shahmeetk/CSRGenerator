#!/bin/bash

# Script to run all tests for the CSR Generator Tool

echo "Running tests for CSR Generator Tool..."

# Change to the project root directory
cd "$(dirname "$0")" || { echo "Error: Could not change to project root directory"; exit 1; }

# Run frontend tests
echo "Running frontend tests..."
(
    cd frontend || { echo "Error: Could not change to frontend directory"; exit 1; }
    npm test -- --watchAll=false
    FRONTEND_RESULT=$?
    echo "Frontend tests result: $FRONTEND_RESULT"
    exit "$FRONTEND_RESULT"
)
FRONTEND_RESULT=$?

# Run backend tests
echo "Running backend tests..."
(
    cd backend || { echo "Error: Could not change to backend directory"; exit 1; }
    # Activate virtual environment if it exists
    # shellcheck disable=SC1091
    if [ -f "venv/bin/activate" ]; then
        . "venv/bin/activate"
    fi
    python -m unittest discover tests
    BACKEND_RESULT=$?
    echo "Backend tests result: $BACKEND_RESULT"
    exit "$BACKEND_RESULT"
)
BACKEND_RESULT=$?

# Run Streamlit tests
echo "Running Streamlit tests..."
python -m unittest streamlit_test.py
STREAMLIT_RESULT=$?

# Check if all tests passed
if [ "$FRONTEND_RESULT" -eq 0 ] && [ "$BACKEND_RESULT" -eq 0 ] && [ "$STREAMLIT_RESULT" -eq 0 ]; then
    echo "All tests passed!"
    exit 0
else
    echo "Some tests failed!"
    exit 1
fi
