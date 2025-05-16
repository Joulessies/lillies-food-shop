from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from rest_framework import status


@api_view(["POST"])
def send_order_confirmation(request):
    try:
        order_details = request.data.get("orderDetails")
        customer_email = request.data.get("customerEmail")

        # Create email content
        html_message = render_to_string(
            "email_template.html",
            {
                "customer_name": order_details["customerInfo"]["name"],
                "items": order_details["items"],
                "total": order_details["total"],
                "delivery_method": order_details["customerInfo"]["deliveryMethod"],
                "phone": order_details["customerInfo"]["phone"],
                "address": order_details["customerInfo"].get(
                    "address", "Pickup at store"
                ),
            },
        )

        # Send email
        send_mail(
            subject="Order Confirmation - Lillies Food Shop",
            message="",  # Plain text version (empty as we're using HTML)
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[customer_email],
            html_message=html_message,
            fail_silently=False,
        )

        return Response(
            {"success": True, "message": "Order confirmation sent successfully"}
        )
    except Exception as e:
        return Response({"success": False, "error": str(e)}, status=500)

@api_view(['GET'])
def health_check(request):
    """
    Health check endpoint that returns basic system information
    """
    import psutil
    import time
    from django.db import connection
    
    # Basic health data
    health_data = {
        "status": "healthy",
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
    
    # Add system info
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
    
    return Response(health_data, status=status.HTTP_200_OK)
