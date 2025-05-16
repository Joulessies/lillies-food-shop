from rest_framework import viewsets, permissions, status, parsers
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from .models import Category, Product, Order, OrderItem
from .serializers import CategorySerializer, ProductSerializer, OrderSerializer, OrderItemSerializer
from django.views import View
from django.http import JsonResponse
from django.db import models
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Count, Sum
from django.utils import timezone
from datetime import timedelta

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    
    def get_permissions(self):
        """
        Allow GET requests for anyone, but require authentication for other methods
        """
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category', 'active', 'is_featured']
    search_fields = ['name', 'description', 'sku']
    ordering_fields = ['name', 'price', 'created_at']
    ordering = ['-created_at']
    
    def get_permissions(self):
        """
        Allow GET requests for anyone, but require authentication for other methods
        """
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get('search', '')
        if search:
            queryset = queryset.filter(
                models.Q(name__icontains=search) |
                models.Q(description__icontains=search) |
                models.Q(category__name__icontains=search)
            )
        return queryset

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Log the request data for debugging
        print(f"Request data: {request.data}")
        print(f"Request files: {request.FILES}")
        
        try:
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response(serializer.data)
        except Exception as e:
            print(f"Error updating product: {str(e)}")
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

# Add these dedicated endpoints for the public menu
@api_view(['GET'])
@permission_classes([AllowAny])
def public_menu_categories(request):
    """
    Public endpoint to get all active menu categories
    """
    categories = Category.objects.all()
    serializer = CategorySerializer(categories, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([AllowAny])
def public_menu_items(request):
    """
    Public endpoint to get all active menu items, 
    optionally filtered by category
    """
    category_id = request.query_params.get('category', None)
    products = Product.objects.filter(active=True)
    
    if category_id:
        products = products.filter(category_id=category_id)
    
    serializer = ProductSerializer(products, many=True, context={'request': request})
    return Response(serializer.data)

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        if not self.request.user.is_staff:
            queryset = queryset.filter(user=self.request.user)
        return queryset

class OrderItemViewSet(viewsets.ModelViewSet):
    queryset = OrderItem.objects.all()
    serializer_class = OrderItemSerializer
    permission_classes = [permissions.IsAuthenticated]

class AdminDashboardView(View):
    def get(self, request, *args, **kwargs):
        return JsonResponse({"message": "Welcome to the Admin Dashboard"})

@api_view(['GET'])
def dashboard_stats(request):
    """
    Get dashboard statistics for admin panel
    """
    try:
        # Count totals
        total_products = Product.objects.count()
        total_categories = Category.objects.count()
        total_orders = Order.objects.count()
        
        # Get recent orders (last 10)
        recent_orders = Order.objects.order_by('-created_at')[:10]
        
        # Get recent products (last 10)
        recent_products = Product.objects.order_by('-created_at')[:10]
        
        # Get low stock products (products with stock less than 5)
        low_stock_products = Product.objects.filter(stock__lt=5).values('id', 'name', 'stock')
        
        # Get all categories with product count
        categories_with_count = []
        categories = Category.objects.all()
        for category in categories:
            product_count = Product.objects.filter(category=category).count()
            cat_data = CategorySerializer(category).data
            cat_data['product_count'] = product_count
            categories_with_count.append(cat_data)
        
        # Calculate category sales
        category_sales = []
        
        for category in categories:
            # Get products in this category
            products = Product.objects.filter(category=category)
            
            # Count orders with these products
            product_ids = products.values_list('id', flat=True)
            order_items = OrderItem.objects.filter(product_id__in=product_ids)
            
            # Calculate total sales for this category
            sales = order_items.aggregate(
                total=Sum('price', default=0)
            )['total'] or 0
            
            category_sales.append({
                'category': category.name,
                'sales': float(sales),
            })
        
        # Format data for API response
        response_data = {
            'total_products': total_products,
            'total_categories': total_categories,
            'total_orders': total_orders,
            'recent_orders': OrderSerializer(recent_orders, many=True).data,
            'recent_products': ProductSerializer(recent_products, many=True).data,
            'low_stock_products': list(low_stock_products),
            'category_sales': category_sales,
            'categories': categories_with_count,
        }
        
        return Response(response_data)
    
    except Exception as e:
        print(f"Error generating dashboard stats: {str(e)}")
        return Response(
            {"detail": "Failed to generate dashboard statistics"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
