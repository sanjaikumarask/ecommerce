from apps.common.kafka_client import get_producer

producer = get_producer()

def publish_order_created(order):
    event = {
        "order_id": order.id,
        "user_id": order.user_id,
        "total": float(order.total),
    }
    producer.send("order.created", event)
    producer.flush()
