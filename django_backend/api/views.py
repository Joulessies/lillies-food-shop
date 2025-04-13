from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings

@api_view(['POST'])
def send_order_confirmation(request):
    try:
        order_details = request.data.get('orderDetails')
        customer_email = request.data.get('customerEmail')

        # Create email content
        html_message = render_to_string('email_template.html', {
            'customer_name': order_details['customerInfo']['name'],
            'items': order_details['items'],
            'total': order_details['total'],
            'delivery_method': order_details['customerInfo']['deliveryMethod'],
            'phone': order_details['customerInfo']['phone'],
            'address': order_details['customerInfo'].get('address', 'Pickup at store')
        })

        # Send email
        send_mail(
            subject='Order Confirmation - Lillies Food Shop',
            message='',  # Plain text version (empty as we're using HTML)
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[customer_email],
            html_message=html_message,
            fail_silently=False,
        )

        return Response({'success': True, 'message': 'Order confirmation sent successfully'})
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=500) 