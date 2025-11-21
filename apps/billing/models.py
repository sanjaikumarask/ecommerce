# apps/billing/models.py
from django.db import models


class Invoice(models.Model):
    # Proper FK to Order instead of plain integer
    order = models.OneToOneField(
        "orders.Order",
        on_delete=models.CASCADE,
        related_name="invoice",
    )
    invoice_id = models.CharField(max_length=50, unique=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    pdf_file = models.FileField(upload_to="invoices/")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.invoice_id} (Order {self.order_id})"
