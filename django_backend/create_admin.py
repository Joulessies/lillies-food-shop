import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lillies_backend.settings')
django.setup()

# Import the CustomUser model and create a superuser
from users.models import CustomUser
from django.contrib.auth import get_user_model

User = get_user_model()

# Define admin user details
admin_email = 'admin@lilliesfood.com'
admin_password = 'AdminPassword123!'
admin_name = 'Admin User'

# Check if the admin user already exists
if not User.objects.filter(email=admin_email).exists():
    print(f"Creating admin user with email: {admin_email}")
    User.objects.create_superuser(
        email=admin_email,
        password=admin_password,
        name=admin_name
    )
    print("Admin user created successfully!")
else:
    print(f"Admin user with email {admin_email} already exists.")
    print("If you want to reset the password, use the reset password functionality.")