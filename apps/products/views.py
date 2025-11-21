from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Product, Category
from .serializers import ProductSerializer, ProductWriteSerializer, CategorySerializer

class ProductViewSet(viewsets.ModelViewSet):
    """
    Products API:
    - GET: read products with nested category info
    - POST/PUT: create/update products with image upload support
    """
    queryset = Product.objects.filter(is_active=True).order_by('-created_at')
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser]  # <-- handle file uploads

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ProductWriteSerializer  # serializer for writes (with image)
        return ProductSerializer  # serializer for GET/list


class CategoryViewSet(viewsets.ModelViewSet):
    """
    Categories API: full CRUD
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
