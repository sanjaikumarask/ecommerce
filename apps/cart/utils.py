import redis
from django.conf import settings
from apps.products.models import Product


def get_redis_connection():
    try:
        return redis.from_url(settings.REDIS_URL)
    except Exception:
        return None


class RedisCart:
    def __init__(self, user_id):
        self.user_id = user_id
        self.key = f"cart:{user_id}"
        self.r = get_redis_connection()

    def _get_product(self, sku):
        try:
            return Product.objects.get(sku=sku)
        except Product.DoesNotExist:
            return None

    def _build_item(self, sku, qty):
        """Return full item with REAL product_id"""
        product = self._get_product(sku)

        if product and hasattr(product, "image") and product.image:
            try:
                image_url = product.image.url
            except:
                image_url = None
        else:
            image_url = None

        return {
            "sku": sku,
            "product_id": product.id if product else None,   # ⭐ REAL PRODUCT ID
            "qty": int(qty),
            "name": product.name if product else "",
            "price": float(product.price),
            "image_url": image_url,
        }

    def add(self, sku, qty=1):
        if not self.r:
            raise RuntimeError("Redis not available")

        current = self.r.hget(self.key, sku)
        qty = int(current) + qty if current else qty

        self.r.hset(self.key, sku, qty)

        return self._build_item(sku, qty)

    def update(self, sku, qty):
        if not self.r:
            raise RuntimeError("Redis not available")

        if qty <= 0:
            self.remove(sku)
            return None

        self.r.hset(self.key, sku, qty)
        return self._build_item(sku, qty)

    def list(self):
        if not self.r:
            return {}

        raw = self.r.hgetall(self.key)
        items = {}

        for sku, qty in raw.items():
            sku = sku.decode()
            qty = int(qty.decode())
            items[sku] = self._build_item(sku, qty)

        return items

    def remove(self, sku):
        if self.r:
            self.r.hdel(self.key, sku)

    def clear(self):
        if self.r:
            self.r.delete(self.key)
