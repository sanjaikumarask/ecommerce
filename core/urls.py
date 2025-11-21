from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.http import HttpResponse


def home(request):
    return HttpResponse("ECOMMERCE API is running", content_type="text/plain")


urlpatterns = [
    path("", home),
    path("admin/", admin.site.urls),

    # --- API ROUTES ---
    path("api/products/", include("apps.products.urls")),
    path("api/cart/", include("apps.cart.urls")),
    path("api/orders/", include("apps.orders.urls")),
    path("api/payments/", include("apps.payments.urls")),
    path("api/billing/", include("apps.billing.urls")),
    path("api/reviews/", include("apps.reviews.urls")),
    path("api/support/", include("apps.support.urls")),
    path("api/inventory/", include("apps.inventory.urls")),

    # --- AUTH ---
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]


if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
