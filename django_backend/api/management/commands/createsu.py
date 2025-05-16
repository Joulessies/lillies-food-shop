from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

class Command(BaseCommand):
    help = 'Creates a superuser'

    def handle(self, *args, **options):
        User = get_user_model()
        if not User.objects.filter(email="admin@example.com").exists():
            User.objects.create_superuser(
                email="admin@example.com",
                password="lilliesadmin",
                name="Admin User"
            )
            self.stdout.write(self.style.SUCCESS('Successfully created superuser')) 