from rest_framework import serializers
from .models import Notification
from django.contrib.auth.models import User


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for Notification model"""
    
    class Meta:
        model = Notification
        fields = [
            'id', 'type', 'title', 'message', 'read', 
            'created_at', 'read_at', 'related_object_type', 
            'related_object_id', 'action_url'
        ]
        read_only_fields = ['id', 'created_at', 'read_at']


class NotificationListSerializer(serializers.ModelSerializer):
    """Serializer for listing notifications"""
    
    time_ago = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id', 'type', 'title', 'message', 'read', 
            'created_at', 'time_ago', 'related_object_type', 
            'related_object_id', 'action_url'
        ]
    
    def get_time_ago(self, obj):
        """Get human-readable time difference"""
        from django.utils import timezone
        now = timezone.now()
        diff = now - obj.created_at
        
        if diff.days > 0:
            return f"{diff.days} day{'s' if diff.days > 1 else ''} ago"
        elif diff.seconds >= 3600:
            hours = diff.seconds // 3600
            return f"{hours} hour{'s' if hours > 1 else ''} ago"
        elif diff.seconds >= 60:
            minutes = diff.seconds // 60
            return f"{minutes} minute{'s' if minutes > 1 else ''} ago"
        else:
            return "Just now"



