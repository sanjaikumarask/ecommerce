from celery import shared_task
from kafka import KafkaProducer
import json

@shared_task
def test_kafka_task(message):
    producer = KafkaProducer(
        bootstrap_servers=['kafka:9092'],
        value_serializer=lambda v: json.dumps(v).encode('utf-8')
    )
    producer.send('test_topic', {'msg': message})
    producer.flush()
    return f"Sent: {message}"
