from apps.common.kafka_client import get_consumer, get_producer
from apps.common.realtime import push_order_update
import time

# Kafka setup
consumer = get_consumer("order.created", "payments_group")
producer = get_producer()


def process_payment(order):
    """Fake payment processing"""
    time.sleep(1)
    return {
        "payment_id": f"PAY-{order['order_id']}",
        "status": "success"
    }


def run_payment_worker():
    print("🟢 PAYMENT WORKER: listening on order.created")

    for msg in consumer:
        order = msg.value
        print("📥 Payment Worker:", order)

        # Validate input (prevent KeyErrors)
        if "order_id" not in order or "user" not in order:
            print("❌ Invalid order payload:", order)
            continue

        result = process_payment(order)

        if result["status"] == "success":
            payload = {
                "order_id": order["order_id"],
                "payment_id": result["payment_id"],
                "user": order["user"],     # FIXED & consistent
            }

            # Publish to Kafka
            producer.send("payment.success", payload)
            producer.flush()

            print("➡️ Published payment.success")

            # Real-time WebSocket update to frontend
            push_order_update(order["order_id"], {
                "event": "payment.success",
                "order_id": order["order_id"],
                "payment_id": result["payment_id"],
                "status": "paid",
            })

            print("📡 WebSocket push sent to order:", order["order_id"])
