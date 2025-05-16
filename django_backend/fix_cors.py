"""
Fix CORS script for Django
Run this script before starting the server to fix CORS settings
"""

import os
import sys
from pathlib import Path

# Get the current directory
BASE_DIR = Path(__file__).resolve().parent

# Path to the settings file
SETTINGS_FILE = os.path.join(BASE_DIR, 'lillies_backend', 'settings.py')

# Read the current settings file
with open(SETTINGS_FILE, 'r') as f:
    content = f.read()

# Check if we need to update
if "CORS_ALLOW_ALL_ORIGINS = True" in content:
    print("Fixing CORS settings...")
    
    # Replace CORS_ALLOW_ALL_ORIGINS
    content = content.replace(
        "CORS_ALLOW_ALL_ORIGINS = True",
        "CORS_ALLOW_ALL_ORIGINS = False"
    )
    
    # Make sure CORS_ALLOW_CREDENTIALS is True
    if "CORS_ALLOW_CREDENTIALS = False" in content:
        content = content.replace(
            "CORS_ALLOW_CREDENTIALS = False",
            "CORS_ALLOW_CREDENTIALS = True"
        )
    
    # Write the updated content back
    with open(SETTINGS_FILE, 'w') as f:
        f.write(content)
    
    print("CORS settings fixed! Now restart your Django server.")
else:
    print("CORS settings already fixed.")

print("\nTo start Django server with fixed CORS settings: python manage.py runserver") 