from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import MeetingViewSet


router = DefaultRouter()
router.register(r'meetings', MeetingViewSet, basename='meetings')

urlpatterns = [
    path('', include(router.urls)),
]


