from rest_framework import serializers
from .models import Product, Category

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']


class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    image_url = serializers.SerializerMethodField()  # <-- full URL for frontend

    class Meta:
        model = Product
        fields = [
            'id', 'sku', 'name', 'category', 'description',
            'price', 'image_url', 'is_active', 'created_at'
        ]

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image:
            return request.build_absolute_uri(obj.image.url)
        return None


class ProductWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['sku', 'name', 'category', 'description', 'price', 'image', 'is_active']
