from rest_framework import serializers
from .models import Ticket, TicketReply

class TicketReplySerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = TicketReply
        fields = ['id', 'ticket', 'user', 'user_name', 'message', 'created_at']


class TicketSerializer(serializers.ModelSerializer):
    replies = TicketReplySerializer(many=True, read_only=True)

    class Meta:
        model = Ticket
        fields = ['id', 'user', 'subject', 'message', 'status', 'created_at', 'replies']
