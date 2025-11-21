from django.core.management.base import BaseCommand
from apps.orders.worker import run_orders_worker

class Command(BaseCommand):
    help = "Run Orders Kafka worker"

    def handle(self, *args, **options):
        run_orders_worker()
