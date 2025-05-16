from django.urls import path, include
from . import views
from users.views import UserListView, UserDetailView

urlpatterns = [
    path('send-email/', views.send_order_confirmation, name='send_order_confirmation'),
    path('users/', UserListView.as_view(), name='admin-users-list'),
    path('users/<int:pk>/', UserDetailView.as_view(), name='admin-user-detail'),
    path('health/', views.health_check, name='health_check'),
] 