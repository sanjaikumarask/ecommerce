from django.urls import path
from .views import (
    CartAddView, CartListView, CartClearView,
    CartUpdateView, CartRemoveView
)

urlpatterns = [
    path("", CartListView.as_view()),
    path("add/", CartAddView.as_view()),
    path("update/", CartUpdateView.as_view()),
    path("remove/", CartRemoveView.as_view()),
    path("clear/", CartClearView.as_view()),
]
