from django.urls import path
from . import views

urlpatterns = [
    path('send-email/', views.send_order_confirmation, name='send_order_confirmation'),
] 