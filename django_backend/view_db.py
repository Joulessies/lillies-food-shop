import sqlite3
import os

# Get the current directory and database path
current_dir = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(current_dir, 'db.sqlite3')

# Connect to the database
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# List all tables
print("==== DATABASE TABLES ====")
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()
for table in tables:
    print(table[0])

# Choose a table to view (for example, users)
print("\n==== USERS TABLE ====")
try:
    cursor.execute("SELECT * FROM users_user;")
    users = cursor.fetchall()
    
    # Get column names
    col_names = [description[0] for description in cursor.description]
    print("Columns:", col_names)
    
    # Print users (limit to 10)
    for user in users[:10]:
        print(user)
except Exception as e:
    print(f"Error: {e}")

conn.close()
