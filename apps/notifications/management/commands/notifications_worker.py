from django.core.management.base import BaseCommand
from apps.notifications.worker import run_notification_worker

class Command(BaseCommand):
    help = "Run Notifications Kafka worker"

    def handle(self, *args, **options):
        run_notification_worker()
