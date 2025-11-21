from kafka import KafkaProducer, KafkaConsumer
import json
import time

KAFKA_BROKER = "kafka:9092"

_producer_instance = None

def get_producer():
    global _producer_instance

    if _producer_instance:
        return _producer_instance

    while True:
        try:
            _producer_instance = KafkaProducer(
                bootstrap_servers=KAFKA_BROKER,
                value_serializer=lambda v: json.dumps(v).encode("utf-8")
            )
            return _producer_instance
        except Exception as e:
            print("⚠️ Kafka producer not ready, retrying...", e)
            time.sleep(2)


def publish(topic, message: dict):
    producer = get_producer()
    producer.send(topic, message)
    producer.flush()


def get_consumer(topics, group_id):
    if isinstance(topics, str):
        topics = [topics]

    while True:
        try:
            consumer = KafkaConsumer(
                *topics,
                bootstrap_servers=KAFKA_BROKER,
                group_id=group_id,
                value_deserializer=lambda v: json.loads(v.decode("utf-8")),
                auto_offset_reset="latest",
                enable_auto_commit=True
            )
            return consumer
        except Exception as e:
            print("⚠️ Kafka consumer not ready, retrying...", e)
            time.sleep(2)
