import razorpay
from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response
from apps.orders.models import Order

@api_view(["POST"])
def create_payment_order(request):
    order_id = request.data.get("order_id")
    order = Order.objects.get(id=order_id)

    client = razorpay.Client(
        auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
    )

    razorpay_order = client.order.create({
        "amount": int(order.total * 100),
        "currency": "INR",
        "receipt": f"order_{order_id}",
    })

    order.customer_info["razorpay_order_id"] = razorpay_order["id"]
    order.save()

    return Response({
        "key": settings.RAZORPAY_KEY_ID,
        "order_id": razorpay_order["id"],
        "amount": float(order.total),
        "email": order.customer_info["email"],
        "name": order.customer_info["first_name"],
    })
