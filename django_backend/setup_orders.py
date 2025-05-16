#!/usr/bin/env python
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lillies_backend.settings')
django.setup()

from django.core.management import call_command
from django.contrib.auth import get_user_model
from lillies_backend.models import Order, OrderItem, Product
from decimal import Decimal
import random

User = get_user_model()

def setup_orders():
    """
    Run migrations and create sample orders
    """
    print("Setting up orders...")
    
    # Run migrations
    print("Running makemigrations...")
    call_command('makemigrations')
    
    print("Running migrate...")
    call_command('migrate')
    
    # Create sample orders
    print("Creating sample orders...")
    create_sample_orders()
    
    print("Orders setup complete!")

def create_sample_orders():
    # Get users
    users = User.objects.all()
    if not users.exists():
        print("No users found. Please create users first.")
        return
    
    # Get products
    products = Product.objects.all()
    if not products.exists():
        print("No products found. Please create products first.")
        return
    
    # Create sample orders
    statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
    
    # Clear existing orders
    Order.objects.all().delete()
    print("Cleared existing orders.")
    
    order_count = 5
    for i in range(order_count):
        user = random.choice(users)
        
        # Create order
        order = Order(
            customer=user,
            customer_name=f"{user.first_name} {user.last_name}".strip() or user.email,
            customer_email=user.email,
            contact_number=f"555-{random.randint(100, 999)}-{random.randint(1000, 9999)}",
            shipping_address=f"{random.randint(100, 999)} Main St, City, State {random.randint(10000, 99999)}",
            status=random.choice(statuses),
        )
        order.save()
        
        # Add order items
        item_count = random.randint(1, 3)
        total_amount = Decimal('0.00')
        
        # Select random products for this order
        order_products = random.sample(list(products), min(item_count, len(products)))
        
        for product in order_products:
            quantity = random.randint(1, 3)
            price = product.price
            
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=quantity,
                price=price
            )
            
            total_amount += price * Decimal(quantity)
        
        # Update order total
        order.total_amount = total_amount
        order.save()
        
        print(f"Created order #{order.id} for {order.customer_name} with total ${total_amount}")
    
    print(f"Successfully created {order_count} sample orders")

if __name__ == "__main__":
    setup_orders() 