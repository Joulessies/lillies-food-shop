"""
Instructions for migrating the database after model changes:

1. Make sure your Django server is not running
2. Open a command prompt or terminal
3. Navigate to the django_backend directory:
   cd c:\Users\Julius\lillies-food-shop\lillies-food-shop\django_backend

4. Create the migration file:
   python manage.py makemigrations lillies_backend

5. Apply the migration:
   python manage.py migrate

6. If needed, create a superuser (if you don't already have one):
   python manage.py createsuperuser

7. Start your server:
   python manage.py runserver

If you encounter issues with migrations:

- For data integrity issues, you may need to use --fake-initial:
  python manage.py migrate --fake-initial

- For schema conflicts, you may need to:
  1. Delete the migrations folder in lillies_backend app
  2. Delete the database file (db.sqlite3)
  3. Run makemigrations and migrate again
     python manage.py makemigrations lillies_backend
     python manage.py migrate

- For immediate testing without migrations, set USE_MOCK_DATA = true in apiService.js
"""
