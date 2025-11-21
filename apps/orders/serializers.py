from rest_framework import serializers
from apps.products.models import Product
from .models import Order, OrderItem


class OrderItemInputSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    qty = serializers.IntegerField()
    price = serializers.DecimalField(max_digits=10, decimal_places=2)


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemInputSerializer(many=True)
    total_amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    customer_info = serializers.DictField()

    class Meta:
        model = Order
        fields = ["id", "items", "total_amount", "customer_info"]

    def create(self, validated_data):
        # Extract validated fields safely
        items_data = validated_data.pop("items", None)
        if not items_data:
            raise serializers.ValidationError({"items": "Items list is required"})

        total = validated_data.pop("total_amount", None)
        if total is None:
            raise serializers.ValidationError({"total_amount": "total_amount is required"})

        customer_info = validated_data.pop("customer_info", {})

        # Create the order first
        order = Order.objects.create(
            user=None,                       # Guest checkout
            total=total,
            customer_info=customer_info,
            status="created"
        )

        # Create all order items
        for item in items_data:

            product_id = item.get("product_id")
            if not product_id:
                raise serializers.ValidationError({
                    "product_id": "product_id is required"
                })

            try:
                product = Product.objects.get(id=product_id)
            except Product.DoesNotExist:
                raise serializers.ValidationError({
                    "product_id": f"Invalid product_id: {product_id}"
                })

            OrderItem.objects.create(
                order=order,
                product=product,
                sku=product.sku or "",
                name=product.name or "",
                price=item.get("price") or 0,
                qty=item.get("qty") or 1
            )

        return order
