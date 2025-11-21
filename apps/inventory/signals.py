from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.orders.models import OrderItem
from .models import Inventory, InventoryLog

@receiver(post_save, sender=OrderItem)
def update_inventory_after_order(sender, instance, created, **kwargs):
    if not created:
        return

    product = instance.product

    # Get or create inventory record
    inv, _ = Inventory.objects.get_or_create(product=product)

    # Decrease stock (FIXED: instance.qty)
    inv.quantity = max(inv.quantity - instance.qty, 0)
    inv.save()

    # Record stock movement (FIXED: instance.qty)
    InventoryLog.objects.create(
        inventory=inv,
        change=-instance.qty,
        movement_type='OUT',
        reason=f"Order #{instance.order.id}",
        updated_by=getattr(instance.order, "user", None)
    )
