from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SprintViewSet,
    SprintTaskViewSet,
    sprint_comments,
    sprint_comment_detail,
    sprint_retrospective,
    users_list,
    ai_suggest_priority,
    ai_generate_description,
    ai_sprint_summary,
    ai_retrospective_insights
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
    # AI endpoints
    path('ai/suggest-priority/', ai_suggest_priority, name='ai-suggest-priority'),
    path('ai/generate-description/', ai_generate_description, name='ai-generate-description'),
    path('sprints/<int:sprint_id>/ai/summary/', ai_sprint_summary, name='ai-sprint-summary'),
    path('sprints/<int:sprint_id>/ai/retrospective-insights/', ai_retrospective_insights, name='ai-retrospective-insights'),
]

