from django.contrib import admin
from .models import ToDo


@admin.register(ToDo)
class ToDoAdmin(admin.ModelAdmin):
    list_display = ['todo_name', 'project', 'priority', 'status', 'start_date', 'end_date']
    list_filter = ['priority', 'status', 'project', 'created_at']
    search_fields = ['todo_name', 'description']
    date_hierarchy = 'created_at'
    ordering = ['-created_at']

