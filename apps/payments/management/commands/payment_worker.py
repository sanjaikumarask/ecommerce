from django.core.management.base import BaseCommand
from apps.payments.worker import run_payment_worker

class Command(BaseCommand):
    def handle(self, *args, **options):
        run_payment_worker()
