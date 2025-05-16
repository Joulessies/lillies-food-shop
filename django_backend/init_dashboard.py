#!/usr/bin/env python
import os
import django
import random
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lillies_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from lillies_backend.models import Category, Product, Order, OrderItem
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

def initialize_dashboard_data():
    """
    Initialize the database with data needed for a good dashboard display
    """
    print("Initializing dashboard data...")
    
    # Ensure we have categories
    categories = ensure_categories()
    
    # Ensure we have products in each category
    products = ensure_products(categories)
    
    # Ensure we have orders
    orders = ensure_orders(products)
    
    print("Dashboard initialization complete!")

def ensure_categories():
    """Ensure we have basic categories"""
    category_names = ["Burgers", "Sides", "Beverages", "Desserts"]
    
    existing_categories = Category.objects.all()
    
    if existing_categories.count() == 0:
        print("Creating categories...")
        for name in category_names:
            Category.objects.create(
                name=name,
                description=f"{name} category description"
            )
    
    return Category.objects.all()

def ensure_products(categories):
    """Ensure we have products in each category"""
    existing_products = Product.objects.all()
    
    if existing_products.count() < 5:
        print("Creating sample products...")
        
        # Clear existing products
        Product.objects.all().delete()
        
        # Product data by category
        product_data = {
            "Burgers": [
                {
                    "name": "Classic Burger",
                    "description": "Our signature burger with cheese, lettuce, and tomato",
                    "price": Decimal("9.99"),
                    "stock": 20,
                    "sku": "BRG-001"
                },
                {
                    "name": "Double Cheeseburger",
                    "description": "Double beef patty with double cheese",
                    "price": Decimal("12.99"),
                    "stock": 15,
                    "sku": "BRG-002"
                },
                {
                    "name": "Veggie Burger",
                    "description": "Plant-based patty with fresh vegetables",
                    "price": Decimal("8.99"),
                    "stock": 10,
                    "sku": "BRG-003",
                    "is_vegetarian": True
                }
            ],
            "Sides": [
                {
                    "name": "French Fries",
                    "description": "Crispy golden fries",
                    "price": Decimal("3.99"),
                    "stock": 30,
                    "sku": "SID-001"
                },
                {
                    "name": "Onion Rings",
                    "description": "Battered and fried onion rings",
                    "price": Decimal("4.99"),
                    "stock": 25,
                    "sku": "SID-002"
                }
            ],
            "Beverages": [
                {
                    "name": "Cola",
                    "description": "Refreshing cola drink",
                    "price": Decimal("2.49"),
                    "stock": 50,
                    "sku": "BEV-001"
                },
                {
                    "name": "Iced Tea",
                    "description": "Freshly brewed iced tea",
                    "price": Decimal("2.99"),
                    "stock": 40,
                    "sku": "BEV-002"
                }
            ],
            "Desserts": [
                {
                    "name": "Chocolate Cake",
                    "description": "Rich chocolate cake slice",
                    "price": Decimal("5.99"),
                    "stock": 4,  # Low stock intentionally for dashboard
                    "sku": "DST-001"
                }
            ]
        }
        
        for category in categories:
            if category.name in product_data:
                for item in product_data[category.name]:
                    Product.objects.create(
                        category=category,
                        active=True,
                        preparation_time=random.randint(5, 25),
                        **item
                    )
    
    return Product.objects.all()

def ensure_orders(products):
    """Ensure we have some orders for statistics"""
    existing_orders = Order.objects.all()
    
    if existing_orders.count() < 3:
        print("Creating sample orders...")
        
        # Clear existing orders
        Order.objects.all().delete()
        
        # Get a user or create one if needed
        users = User.objects.all()
        if not users.exists():
            user = User.objects.create_user(
                email="customer@example.com",
                password="customer123",
                first_name="John",
                last_name="Doe"
            )
        else:
            user = users.first()
        
        # Create orders
        statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
        
        for i in range(5):
            # Create date gradually going back in time
            days_ago = i * 2
            order_date = timezone.now() - timedelta(days=days_ago)
            
            order = Order.objects.create(
                customer=user,
                customer_name=f"{user.first_name} {user.last_name}",
                customer_email=user.email,
                contact_number=f"555-{random.randint(100, 999)}-{random.randint(1000, 9999)}",
                shipping_address=f"{random.randint(100, 999)} Main St, City, State {random.randint(10000, 99999)}",
                status=statuses[i % len(statuses)],
                order_date=order_date,
                created_at=order_date
            )
            
            # Add 1-3 products to the order
            num_products = random.randint(1, 3)
            order_products = random.sample(list(products), min(num_products, len(products)))
            
            total_amount = Decimal('0.00')
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
            
            order.total_amount = total_amount
            order.save()
            
            print(f"Created order #{order.id} with total ${total_amount}")
    
    return Order.objects.all()

if __name__ == "__main__":
    initialize_dashboard_data() 