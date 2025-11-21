from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Order
from apps.common.kafka_client import publish
from apps.notifications.utils import send_notification_event


@receiver(post_save, sender=Order)
def publish_order_created(sender, instance, created, **kwargs):
    if created and instance.status == "created":

        # SAFE email handling for guest + logged-in users
        customer_email = None
        if instance.user and instance.user.email:
            customer_email = instance.user.email
        else:
            customer_email = instance.customer_info.get("email")

        payload = {
            "order_id": instance.id,
            "user_id": instance.user_id,
            "total": str(instance.total),
            "items": [
                {
                    "sku": it.sku,
                    "qty": it.qty,
                    "price": str(it.price)
                }
                for it in instance.items.all()
            ],
            "customer_email": customer_email,
        }

        # Publish to Kafka
        try:
            publish("order.created", payload)
        except Exception as e:
            print("Failed publishing order.created:", e)

        # Optional notification
        try:
            send_notification_event("order.created", payload)
        except Exception as e:
            print("Failed sending notification event:", e)
