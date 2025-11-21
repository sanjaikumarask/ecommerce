# apps/common/realtime.py
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync


def push_order_update(order_id: int, payload: dict):
    """
    Synchronous helper usable from normal sync worker code.
    payload should be JSON-serializable (dict).
    """
    channel_layer = get_channel_layer()
    group = f"order_{order_id}"
    async_to_sync(channel_layer.group_send)(
        group,
        {
            "type": "order_update",
            "data": payload,
        },
    )
