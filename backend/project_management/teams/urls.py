from django.urls import path
from . import views

app_name = 'teams'

urlpatterns = [
    path('teams/', views.team_list, name='team-list'),  # GET list, POST create
    path('teams/<int:pk>/', views.team_detail, name='team-detail'),  # GET/PUT/DELETE
    path('teams-stats/', views.team_stats, name='team-stats'),  # GET stats
]

