from django.urls import path
from .views import create_payment_order
from .webhooks import razorpay_webhook

urlpatterns = [
    path("create-order/", create_payment_order),
    path("webhook/", razorpay_webhook),
]
