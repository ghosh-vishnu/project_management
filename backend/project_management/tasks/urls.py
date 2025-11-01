from django.urls import path
from . import views

app_name = 'tasks'

urlpatterns = [
    path('tasks/', views.task_list, name='task-list'),
    path('tasks/<int:pk>/', views.task_detail, name='task-detail'),
    path('tasks/remove-duplicates/', views.remove_duplicate_tasks, name='remove-duplicate-tasks'),
]





