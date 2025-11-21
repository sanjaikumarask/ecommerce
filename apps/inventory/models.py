from django.db import models
from django.contrib.auth import get_user_model
from apps.products.models import Product

User = get_user_model()

class Inventory(models.Model):
    product = models.OneToOneField(
        Product,
        on_delete=models.CASCADE,
        related_name='inventory'
    )
    quantity = models.PositiveIntegerField(default=0)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.product.name} - {self.quantity} in stock"

    class Meta:
        verbose_name_plural = "Inventory"
        ordering = ["product__name"]


class InventoryLog(models.Model):
    """
    Tracks stock movements for each product's inventory.
    """
    MOVEMENT_TYPES = [
        ('IN', 'Stock In'),
        ('OUT', 'Stock Out'),
    ]

    inventory = models.ForeignKey(
        Inventory,
        on_delete=models.CASCADE,
        related_name='logs'
    )
    change = models.IntegerField()  # + for IN, - for OUT
    movement_type = models.CharField(max_length=3, choices=MOVEMENT_TYPES)
    updated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='inventory_logs'
    )
    reason = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.inventory.product.name} ({self.movement_type} {self.change})"

    class Meta:
        verbose_name = "Inventory Log"
        verbose_name_plural = "Inventory Logs"
        ordering = ["-created_at"]
