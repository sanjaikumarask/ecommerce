from django.urls import path
from .views import CreateOrderAPI

urlpatterns = [
    path("", CreateOrderAPI.as_view(), name="order-create"),  # POST /api/orders/
]
