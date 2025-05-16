from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, ProductViewSet, OrderViewSet, dashboard_stats, public_menu_categories, public_menu_items
from api.views import health_check
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.views.generic import RedirectView

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'products', ProductViewSet)
router.register(r'orders', OrderViewSet)

@api_view(['GET'])
def health_check(request):
    """
    Health check endpoint for AWS Elastic Beanstalk
    """
    import psutil
    import time
    from django.db import connection
    
    # Basic health data
    health_data = {
        "status": "healthy",
        "message": "API is running",
        "timestamp": time.time()
    }
    
    # Check database connection
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            health_data["database"] = "connected"
    except Exception as e:
        health_data["database"] = "error"
        health_data["database_error"] = str(e)
    
    # Add system info if psutil is available
    try:
        health_data["memory"] = {
            "total_gb": round(psutil.virtual_memory().total / (1024**3), 2),
            "available_percent": psutil.virtual_memory().percent
        }
        health_data["cpu_usage_percent"] = psutil.cpu_percent(interval=0.1)
        health_data["disk_usage_percent"] = psutil.disk_usage('/').percent
    except:
        # Don't fail health check if psutil can't get system info
        health_data["system_info"] = "unavailable"
    
    return Response(health_data)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/auth/', include('users.urls')),
    path('api/admin/', include('api.urls')),
    path('api/dashboard/stats/', dashboard_stats, name='dashboard-stats'),
    
    # Public menu endpoints (no authentication required)
    path('api/menu/categories/', public_menu_categories, name='public-menu-categories'),
    path('api/menu/items/', public_menu_items, name='public-menu-items'),
    
    # Health check endpoint
    path('api/health/', health_check, name='health-check'),
    path('', RedirectView.as_view(url='/api/')),
]

# Serve static files in development and production
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)