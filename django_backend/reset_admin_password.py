import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lillies_backend.settings')
django.setup()

# Import the User model
from django.contrib.auth import get_user_model

User = get_user_model()

# Admin email to reset
admin_email = 'admin@lilliesfood.com'
new_password = 'NewAdminPass123'

try:
    # Get the admin user
    admin_user = User.objects.get(email=admin_email)
    
    # Set the new password
    admin_user.set_password(new_password)
    admin_user.save()
    
    print(f"Password for {admin_email} has been reset successfully!")
    print(f"New password: {new_password}")
    print("You can now use these credentials to log in.")
    
except User.DoesNotExist:
    print(f"User with email {admin_email} does not exist.")
except Exception as e:
    print(f"An error occurred: {e}")