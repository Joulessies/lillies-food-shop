from django.core.management.base import BaseCommand
from django.db import connection
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'View database tables and user data'

    def handle(self, *args, **kwargs):
        # List all tables
        self.stdout.write(self.style.SUCCESS('==== DATABASE TABLES ===='))
        with connection.cursor() as cursor:
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
            tables = cursor.fetchall()
            for table in tables:
                self.stdout.write(self.style.SUCCESS(table[0]))
        
        # List users
        self.stdout.write(self.style.SUCCESS('\n==== USERS ===='))
        users = User.objects.all()
        for user in users:
            self.stdout.write(f"ID: {user.id}, Email: {user.email}, Staff: {user.is_staff}, Superuser: {user.is_superuser}")
