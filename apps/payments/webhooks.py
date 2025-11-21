import json
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from razorpay import Client
from apps.orders.models import Order
from apps.common.kafka_client import publish

@csrf_exempt
def razorpay_webhook(request):
    payload = request.body.decode()
    razorpay_signature = request.headers.get("X-Razorpay-Signature")

    client = Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

    # Validate signature safely
    try:
        client.utility.verify_webhook_signature(
            payload,
            razorpay_signature,
            settings.RAZORPAY_WEBHOOK_SECRET,
        )
    except:
        # Always return 200 so Razorpay doesn't retry or block you
        return HttpResponse(status=200)

    data = json.loads(payload)

    # Handle successful payment
    if data["event"] == "payment.captured":
        payment = data["payload"]["payment"]["entity"]
        razorpay_order_id = payment["order_id"]
        payment_id = payment["id"]

        order = Order.objects.get(
            customer_info__razorpay_order_id=razorpay_order_id
        )

        order.status = "paid"
        order.customer_info["payment_id"] = payment_id
        order.save()

        # Trigger Kafka
        publish("payment.success", {
            "order_id": order.id,
            "total": float(order.total),
            "email": order.customer_info["email"],
            "name": order.customer_info["first_name"],
        })

    return HttpResponse(status=200)
