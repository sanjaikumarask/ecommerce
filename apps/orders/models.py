from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Order(models.Model):
    STATUS_CHOICES = [
        ('created', 'Created'),
        ('processing', 'Processing'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
        ('shipped', 'Shipped'),
        ('cancelled', 'Cancelled'),
    ]

    user = models.ForeignKey(User, null=True, blank=True,
                             on_delete=models.SET_NULL)  # guest allowed

    total = models.DecimalField(max_digits=12, decimal_places=2)
    customer_info = models.JSONField(default=dict)  # FIXED
    status = models.CharField(max_length=20,
                              choices=STATUS_CHOICES,
                              default='created')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order #{self.id}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items',
                              on_delete=models.CASCADE)
    product = models.ForeignKey('products.Product',
                                null=True,
                                on_delete=models.SET_NULL)
    sku = models.CharField(max_length=64)
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    qty = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.name} x{self.qty}"
