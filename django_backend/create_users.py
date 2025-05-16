import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lillies_backend.settings')
django.setup()

from users.models import CustomUser

# List of users to create
users_to_create = [
    {
        "email": "staff@lilliesfood.com",
        "name": "Staff User",
        "password": "StaffPass123",
        "role": "staff",
        "is_staff": True,
        "is_superuser": False
    },
    {
        "email": "customer@example.com",
        "name": "Regular Customer",
        "password": "CustomerPass123",
        "role": "customer",
        "is_staff": False,
        "is_superuser": False
    },
    {
        "email": "manager@lilliesfood.com",
        "name": "Manager User",
        "password": "ManagerPass123",
        "role": "staff",
        "is_staff": True,
        "is_superuser": False
    }
]

# Create users
for user_data in users_to_create:
    email = user_data["email"]
    # Check if user already exists
    if CustomUser.objects.filter(email=email).exists():
        print(f"User with email {email} already exists. Skipping.")
        continue
    
    # Create user
    user = CustomUser.objects.create_user(
        email=user_data["email"],
        name=user_data["name"],
        password=user_data["password"],
        role=user_data["role"],
        is_staff=user_data["is_staff"],
        is_superuser=user_data["is_superuser"]
    )
    print(f"Created user: {user.email} ({user.role})")

print("User creation completed!")