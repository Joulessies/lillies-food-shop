from django.db import models
from django.conf import settings
from django.contrib.auth import get_user_model
import os

User = get_user_model()

class Category(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Product(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.ForeignKey('Category', on_delete=models.CASCADE)
    active = models.BooleanField(default=True)
    image = models.ImageField(upload_to='products/', null=True, blank=True)
    stock = models.IntegerField(default=0)
    sku = models.CharField(max_length=100, unique=True, null=True, blank=True)
    preparation_time = models.IntegerField(help_text='Preparation time in minutes', default=30)
    calories = models.IntegerField(null=True, blank=True)
    ingredients = models.TextField(null=True, blank=True)
    allergens = models.TextField(null=True, blank=True)
    is_vegetarian = models.BooleanField(default=False)
    is_vegan = models.BooleanField(default=False)
    is_gluten_free = models.BooleanField(default=False)
    discount_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    def delete_image_if_exists(self):
        if self.image:
            if os.path.isfile(self.image.path):
                os.remove(self.image.path)
            self.image = None

    def delete(self, *args, **kwargs):
        self.delete_image_if_exists()
        super().delete(*args, **kwargs)

    def save(self, *args, **kwargs):
        if self.pk:
            try:
                old_instance = Product.objects.get(pk=self.pk)
                if old_instance.image and self.image and old_instance.image != self.image:
                    old_instance.delete_image_if_exists()
            except Product.DoesNotExist:
                pass
        super().save(*args, **kwargs)

    @property
    def is_in_stock(self):
        return self.stock > 0 if self.stock is not None else False
        
    @property
    def final_price(self):
        if self.discount_price is not None:
            return self.discount_price
        return self.price

class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]
    
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    customer_name = models.CharField(max_length=255, blank=True)
    customer_email = models.EmailField(blank=True)
    contact_number = models.CharField(max_length=20, blank=True)
    shipping_address = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    order_date = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    def __str__(self):
        return f"Order #{self.id} by {self.customer.email}"
        
    def save(self, *args, **kwargs):
        # Auto-populate customer information if not provided
        if not self.customer_name and self.customer:
            self.customer_name = self.customer.get_full_name() or self.customer.email
        if not self.customer_email and self.customer:
            self.customer_email = self.customer.email
        super().save(*args, **kwargs)

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.product.name} x {self.quantity}"
