from rest_framework import viewsets, permissions
from rest_framework.pagination import PageNumberPagination
from .models import Meeting
from .serializers import MeetingSerializer, MeetingListSerializer


class MeetingPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class MeetingViewSet(viewsets.ModelViewSet):
    queryset = Meeting.objects.all().select_related("scheduled_by").prefetch_related("attendees")
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = MeetingPagination

    def get_serializer_class(self):
        if self.action in ["list"]:
            return MeetingListSerializer
        return MeetingSerializer

    def perform_create(self, serializer):
        # Default scheduled_by to current user when not provided explicitly
        try:
            scheduled_by = serializer.validated_data.get("scheduled_by") or getattr(self.request, 'user', None)
            if scheduled_by is None or not getattr(scheduled_by, 'is_authenticated', False):
                # Fallback safety: DRF enforces IsAuthenticated, but keep guard
                raise ValueError("Authenticated user is required to schedule a meeting.")
            serializer.save(scheduled_by=scheduled_by)
        except Exception as e:
            # Re-raise as ValidationError so DRF returns 400 with message
            from rest_framework.exceptions import ValidationError
            raise ValidationError({'error': f'Failed to create meeting: {str(e)}'})
