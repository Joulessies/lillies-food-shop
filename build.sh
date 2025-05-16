#!/bin/bash
set -e

# Navigate to the Django project directory
cd django_backend

# Install dependencies
pip install -r requirements.txt

# Collect static files
python manage.py collectstatic --noinput

# Create required directories
mkdir -p staticfiles
mkdir -p media

# Navigate back to the root directory
cd ..

# Make the script executable
chmod +x build.sh

echo "Build completed successfully" 