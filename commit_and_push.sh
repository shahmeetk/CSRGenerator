#!/bin/bash

# Script to commit and push the code to GitHub

echo "Committing and pushing code to GitHub..."

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "Git is not installed. Please install git and try again."
    exit 1
fi

# Initialize git repository if not already initialized
if [ ! -d ".git" ]; then
    git init
    echo "Git repository initialized."
fi

# Add all files to git
git add .

# Commit changes
git commit -m "Initial commit for CSR Generator Tool with comprehensive documentation and automated tests"

# Add GitHub remote if not already added
if ! git remote | grep -q "origin"; then
    git remote add origin https://github.com/shahmeetk/CSRGenerator.git
    echo "Added GitHub remote."
fi

# Push to GitHub
echo "Pushing to GitHub..."
git push -u origin main

echo "Code committed and pushed to GitHub."
echo "Visit https://github.com/shahmeetk/CSRGenerator to see your repository."

# Instructions for deployment
echo ""
echo "Next steps for deployment:"
echo "1. GitHub Pages (React frontend) will be automatically deployed via GitHub Actions"
echo "2. For the backend, follow the instructions in the README.md to deploy to Render"
echo "3. For the Streamlit version, follow the instructions in the README.md to deploy to Streamlit Cloud"
echo ""
echo "Your application will be available at: https://shahmeetk.github.io/CSRGenerator"
