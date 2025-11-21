from rest_framework.routers import DefaultRouter
from .views import InventoryViewSet, InventoryLogViewSet

router = DefaultRouter()
router.register('inventory', InventoryViewSet)
router.register('logs', InventoryLogViewSet)

urlpatterns = router.urls
