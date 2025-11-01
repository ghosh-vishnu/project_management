from django.urls import path
from . import views

app_name = 'projects_compat'

urlpatterns = [
    path('', views.project_list, name='project-list'),
    path('<int:pk>/', views.project_detail, name='project-detail'),
    path('projects-name/', views.project_names_list, name='project-names-list'),
]



