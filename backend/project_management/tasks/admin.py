from django.contrib import admin
from .models import Task


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['task_name', 'project', 'assigned_to', 'priority', 'status', 'start_date', 'end_date']
    list_filter = ['priority', 'status', 'project', 'created_at']
    search_fields = ['task_name', 'description']
    date_hierarchy = 'created_at'
    ordering = ['-created_at']
