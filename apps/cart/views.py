from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .utils import RedisCart

def get_uid(request):
    return request.user.id if request.user.is_authenticated else request.data.get("guest_id") or request.query_params.get("guest_id")


class CartAddView(APIView):
    def post(self, request):
        uid = get_uid(request)
        if not uid:
            return Response({"detail": "guest_id required"}, status=400)

        sku = request.data.get("sku")
        qty = int(request.data.get("qty", 1))

        cart = RedisCart(uid)
        item = cart.add(sku, qty)

        return Response(item)


class CartUpdateView(APIView):
    def post(self, request):
        uid = get_uid(request)
        if not uid:
            return Response({"detail": "guest_id required"}, status=400)

        sku = request.data.get("sku")
        qty = int(request.data.get("qty"))

        cart = RedisCart(uid)
        item = cart.update(sku, qty)

        return Response(item)


class CartListView(APIView):
    def get(self, request):
        uid = get_uid(request)
        if not uid:
            return Response({"detail": "guest_id required"}, status=400)

        cart = RedisCart(uid)
        return Response(cart.list())


class CartRemoveView(APIView):
    def post(self, request):
        uid = get_uid(request)
        sku = request.data.get("sku")

        cart = RedisCart(uid)
        cart.remove(sku)

        return Response({"ok": True})


class CartClearView(APIView):
    def post(self, request):
        uid = get_uid(request)
        cart = RedisCart(uid)
        cart.clear()
        return Response({"ok": True})
