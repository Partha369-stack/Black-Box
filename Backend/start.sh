#!/bin/bash
echo "Starting BlackBox Backend..."
echo "Python version:"
python --version
echo "Installing dependencies..."
pip install -r requirements.txt
echo "Starting application..."
python index.py
