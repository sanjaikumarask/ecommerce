# apps/realtime/consumers.py
from channels.generic.websocket import AsyncWebsocketConsumer
import json


class OrderStatusConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # order_id passed via URL path
        self.order_id = str(self.scope["url_route"]["kwargs"]["order_id"])
        self.group_name = f"order_{self.order_id}"

        # join group
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        # leave group
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    # called when a worker sends a group message with type='order_update'
    async def order_update(self, event):
        # event['data'] is a dict
        await self.send(text_data=json.dumps(event["data"]))
