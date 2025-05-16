"""
Script to migrate data from SQLite to PostgreSQL.
Run this locally after setting up your Render PostgreSQL database.

Usage:
1. Install requirements: pip install dj-database-url psycopg2-binary
2. Set DATABASE_URL environment variable to your Render PostgreSQL URL
3. Run: python migrate_data.py
"""

import os
import json
import subprocess
from pathlib import Path

# Ensure we're in the right directory
BASE_DIR = Path(__file__).resolve().parent

# Step 1: Dump data from SQLite
print("Dumping data from SQLite...")
subprocess.run(
    ["python", "manage.py", "dumpdata", "--exclude", "auth.permission", 
     "--exclude", "contenttypes", "--indent", "2", "-o", "data_dump.json"],
    cwd=BASE_DIR,
    check=True,
)

# Step 2: Load data into PostgreSQL
print("Loading data into PostgreSQL...")
if os.environ.get("DATABASE_URL"):
    # Make sure migrations are applied to PostgreSQL
    subprocess.run(
        ["python", "manage.py", "migrate"],
        cwd=BASE_DIR,
        check=True,
    )
    
    # Load the dumped data
    subprocess.run(
        ["python", "manage.py", "loaddata", "data_dump.json"],
        cwd=BASE_DIR,
        check=True,
    )
    
    print("Data migration completed successfully!")
else:
    print("Error: DATABASE_URL environment variable not set.")
    print("Please set it to your Render PostgreSQL database URL and try again.") 