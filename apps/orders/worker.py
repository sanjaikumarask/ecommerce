import json
from apps.common.kafka_client import publish, get_consumer

def run_orders_worker():
    print("🟢 Orders worker started. Listening for topic: order.created")

    consumer = get_consumer("order.created", "orders_group")  # FIXED

    for msg in consumer:
        data = msg.value
        print("📥 Orders Worker Received:", data)

        # Example: process order here...
        print("✔ Order processed")

        # Re-publish to next stage in pipeline
        publish("billing.invoice_generated", data)  # FIXED
        print("➡️ Sent to billing.invoice_generated")
