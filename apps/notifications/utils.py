import json
from kafka import KafkaProducer
from django.conf import settings

def send_notification_event(event_type, data):
    """
    Publish a notification event to Kafka topic 'ecommerce-events'.
    """
    producer = KafkaProducer(
        bootstrap_servers=[settings.KAFKA_BOOTSTRAP_SERVERS],
        value_serializer=lambda v: json.dumps(v).encode('utf-8')
    )
    producer.send(
        'ecommerce-events',
        {
            'type': event_type,
            'data': data
        }
    )
    producer.flush()
