from django.contrib import admin
from .models import Inventory, InventoryLog

@admin.register(Inventory)
class InventoryAdmin(admin.ModelAdmin):
    list_display = ("id", "product", "quantity", "last_updated")
    search_fields = ("product__name",)
    list_filter = ("last_updated",)


@admin.register(InventoryLog)
class InventoryLogAdmin(admin.ModelAdmin):
    list_display = ("id", "inventory", "movement_type", "change", "updated_by", "reason", "created_at")
    list_filter = ("movement_type", "created_at")
    search_fields = ("inventory__product__name", "updated_by__username", "reason")
