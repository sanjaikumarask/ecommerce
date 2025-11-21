from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import OrderSerializer
from apps.common.kafka_client import get_producer


class CreateOrderAPI(APIView):
    authentication_classes = []    # allow guest checkout
    permission_classes = []        # allow guest checkout

    def post(self, request):
        serializer = OrderSerializer(data=request.data)

        if not serializer.is_valid():
            print("ORDER VALIDATION FAILED:", serializer.errors)  # debug
            return Response(serializer.errors, status=400)

        order = serializer.save()

        # Send Kafka event
        try:
            producer = get_producer()
            producer.send("order.created", {
                "order_id": order.id,
                "total": float(order.total),
                "user": None
            })
            producer.flush()
        except Exception as e:
            print("Kafka error:", e)

        return Response({"id": order.id}, status=201)
