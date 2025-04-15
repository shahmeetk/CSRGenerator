#!/bin/bash

# Run the Streamlit app locally

# Create a virtual environment if it doesn't exist
if [ ! -d "streamlit_env" ]; then
    echo "Creating virtual environment..."
    python -m venv streamlit_env
fi

# Activate the virtual environment
source streamlit_env/bin/activate

# Install requirements
echo "Installing requirements..."
pip install -r streamlit_requirements.txt

# Run the Streamlit app
echo "Starting Streamlit app..."
streamlit run streamlit_simple.py
