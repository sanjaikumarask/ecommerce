from django.contrib import admin
from .models import Product, Category

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "slug")
    search_fields = ("name",)
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('sku', 'name', 'price', 'category', 'is_active', 'created_at')
    search_fields = ('name', 'sku')
    list_filter = ('category', 'is_active')
    prepopulated_fields = {'slug': ('name',)}

def inventory_quantity(self, obj):
    # Assumes Product has a OneToOneField to Inventory named 'inventory'
    return getattr(obj, 'inventory', None).quantity if hasattr(obj, 'inventory') else 0
inventory_quantity.short_description = 'Stock'
list_display = ('sku', 'name', 'price', 'category', 'is_active', 'created_at', 'inventory_quantity')
