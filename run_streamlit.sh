#!/bin/bash

# Run the Streamlit app locally

# Check if streamlit is installed
if ! command -v streamlit &> /dev/null; then
    echo "Streamlit is not installed. Installing now..."
    pip install -r streamlit_requirements.txt
fi

# Run the Streamlit app
echo "Starting Streamlit app..."
streamlit run streamlit_app.py
