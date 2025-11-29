from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from .models import Notification
from .serializers import NotificationSerializer, NotificationListSerializer
from django.db.models import Q, Count
import json


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notification_list(request):
    """Get all notifications for the current user"""
    try:
        notifications = Notification.objects.filter(user=request.user)
        
        # Filter by read status if provided
        read_filter = request.query_params.get('read', None)
        if read_filter is not None:
            read_filter = read_filter.lower() == 'true'
            notifications = notifications.filter(read=read_filter)
        
        # Filter by type if provided
        type_filter = request.query_params.get('type', None)
        if type_filter:
            notifications = notifications.filter(type=type_filter)
        
        # Pagination
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))
        start = (page - 1) * page_size
        end = start + page_size
        
        total = notifications.count()
        notifications = notifications[start:end]
        
        serializer = NotificationListSerializer(notifications, many=True)
        
        return Response({
            'count': total,
            'results': serializer.data,
            'page': page,
            'page_size': page_size
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notification_unread_count(request):
    """Get count of unread notifications"""
    try:
        count = Notification.objects.filter(
            user=request.user,
            read=False
        ).count()
        
        return Response({
            'unread_count': count
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def notification_mark_read(request, notification_id):
    """Mark a specific notification as read"""
    try:
        notification = Notification.objects.get(
            id=notification_id,
            user=request.user
        )
        notification.mark_as_read()
        
        serializer = NotificationSerializer(notification)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except Notification.DoesNotExist:
        return Response(
            {'error': 'Notification not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def notification_mark_all_read(request):
    """Mark all notifications as read for the current user"""
    try:
        updated = Notification.objects.filter(
            user=request.user,
            read=False
        ).update(read=True)
        
        return Response({
            'message': f'{updated} notifications marked as read',
            'updated_count': updated
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def notification_delete(request, notification_id):
    """Delete a specific notification"""
    try:
        notification = Notification.objects.get(
            id=notification_id,
            user=request.user
        )
        notification.delete()
        
        return Response(
            {'message': 'Notification deleted successfully'},
            status=status.HTTP_200_OK
        )
        
    except Notification.DoesNotExist:
        return Response(
            {'error': 'Notification not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def notification_create(request):
    """Create a notification (for testing or admin use)"""
    try:
        user_id = request.data.get('user_id')
        if not user_id:
            return Response(
                {'error': 'user_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = User.objects.get(id=user_id)
        
        notification = Notification.create_notification(
            user=user,
            type=request.data.get('type', 'info'),
            title=request.data.get('title', ''),
            message=request.data.get('message', ''),
            related_object_type=request.data.get('related_object_type'),
            related_object_id=request.data.get('related_object_id'),
            action_url=request.data.get('action_url')
        )
        
        serializer = NotificationSerializer(notification)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
