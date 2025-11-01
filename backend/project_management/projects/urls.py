from django.urls import path
from . import views

app_name = 'projects'

urlpatterns = [
    path('projects-name/', views.project_names_list, name='project-names-list'),
]

