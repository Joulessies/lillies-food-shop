from rest_framework import serializers
from .models import Category, Product, Order, OrderItem
from django.core.validators import FileExtensionValidator

class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    image = serializers.ImageField(
        required=False,
        allow_null=True,
        validators=[
            FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'gif'])
        ]
    )

    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'price', 'image', 'category', 'category_name', 'active', 'stock', 'sku', 'preparation_time', 'calories', 'ingredients', 'allergens', 'is_vegetarian', 'is_vegan', 'is_gluten_free', 'discount_price', 'is_featured', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

    def create(self, validated_data):
        return Product.objects.create(**validated_data)

    def update(self, instance, validated_data):
        # Handle image update separately
        image = validated_data.pop('image', None)
        if image is not None:
            # Delete old image if it exists
            if instance.image:
                instance.delete_image_if_exists()
            instance.image = image

        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        if request and instance.image:
            # Build absolute URL for the image
            data['image'] = request.build_absolute_uri(instance.image.url)
            print(f"Image URL: {data['image']}")  # Debug print
        return data

class CategorySerializer(serializers.ModelSerializer):
    products = ProductSerializer(many=True, read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'created_at', 'updated_at', 'products']

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_price = serializers.DecimalField(source='product.price', max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'product_price', 'quantity', 'price']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    customer_email = serializers.EmailField(read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'customer', 'customer_name', 'customer_email', 
            'contact_number', 'shipping_address', 'status', 
            'order_date', 'created_at', 'updated_at', 
            'total_amount', 'items'
        ]
        read_only_fields = ['created_at', 'updated_at', 'order_date']
