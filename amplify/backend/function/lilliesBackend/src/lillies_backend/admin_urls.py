from django.urls import path, include
from rest_framework.routers import DefaultRouter
from lillies_backend.views import CategoryViewSet, ProductViewSet, OrderViewSet
from users.views import UserListView, UserDetailView
from . import views

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='admin-categories')
router.register(r'products', ProductViewSet, basename='admin-products')
router.register(r'orders', OrderViewSet, basename='admin-orders')

urlpatterns = [
    path('users/', UserListView.as_view(), name='admin-users-list'),
    path('users/<int:pk>/', UserDetailView.as_view(), name='admin-user-detail'),
    path('dashboard/', views.AdminDashboardView.as_view(), name='admin-dashboard'),
    path('', include(router.urls)),
]
