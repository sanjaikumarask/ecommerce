from django.contrib import admin
from .models import Invoice


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ("invoice_id", "order", "amount", "created_at")
    search_items = ("invoice_id", "order__id")
    readonly_fields = ("invoice_id", "order", "amount", "pdf_file", "created_at")
