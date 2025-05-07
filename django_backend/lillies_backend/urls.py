from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, ProductViewSet, OrderViewSet, dashboard_stats, public_menu_categories, public_menu_items

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'products', ProductViewSet)
router.register(r'orders', OrderViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/auth/', include('users.urls')),
    path('api/admin/', include('api.urls')),
    path('api/dashboard/stats/', dashboard_stats, name='dashboard-stats'),
    
    # Public menu endpoints (no authentication required)
    path('api/menu/categories/', public_menu_categories, name='public-menu-categories'),
    path('api/menu/items/', public_menu_items, name='public-menu-items'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)