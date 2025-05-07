import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

# Change the password
from django.contrib.auth import get_user_model
User = get_user_model()

try:
    admin_user = User.objects.get(email='admin@example.com')
    admin_user.set_password('lilliesadmin')
    admin_user.save()
    print("Admin password successfully changed to 'lilliesadmin'")
except User.DoesNotExist:
    print("Admin user not found")
