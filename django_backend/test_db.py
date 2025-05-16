import os
import django
from django.conf import settings

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lillies_backend.settings')
django.setup()

# Test database connection
from django.db import connections
from django.db.utils import OperationalError

def test_connection():
    try:
        conn = connections['default']
        conn.cursor()
        print("✅ Database connection successful!")
    except OperationalError as e:
        print("❌ Database connection failed!")
        print(f"Error: {e}")

if __name__ == "__main__":
    test_connection() 