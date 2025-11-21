from django.core.management.base import BaseCommand
from apps.billing.worker import run_billing_worker

class Command(BaseCommand):
    def handle(self, *args, **options):
        run_billing_worker()
