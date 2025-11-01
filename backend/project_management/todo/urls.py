from django.urls import path
from . import views

app_name = 'todo'

urlpatterns = [
    path('todo/', views.todo_list, name='todo-list'),
    path('todo/<int:pk>/', views.todo_detail, name='todo-detail'),
]

