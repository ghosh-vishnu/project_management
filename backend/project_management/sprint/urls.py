from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SprintViewSet,
    SprintTaskViewSet,
    sprint_comments,
    sprint_comment_detail,
    sprint_retrospective,
    users_list
)

router = DefaultRouter()
router.register(r'sprints', SprintViewSet, basename='sprint')
router.register(r'sprint-tasks', SprintTaskViewSet, basename='sprint-task')

urlpatterns = [
    path('', include(router.urls)),
    path('sprints/<int:sprint_id>/comments/', sprint_comments, name='sprint-comments'),
    path('sprints/<int:sprint_id>/comments/<int:comment_id>/', sprint_comment_detail, name='sprint-comment-detail'),
    path('sprints/<int:sprint_id>/retrospective/', sprint_retrospective, name='sprint-retrospective'),
    path('sprint-users/', users_list, name='sprint-users'),
]

