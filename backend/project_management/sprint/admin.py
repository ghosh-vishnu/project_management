from django.contrib import admin
from .models import Sprint, SprintTask, SprintComment, SprintRetrospective


@admin.register(Sprint)
class SprintAdmin(admin.ModelAdmin):
    list_display = ['name', 'project', 'start_date', 'end_date', 'progress', 'status', 'created_at']
    list_filter = ['status', 'project', 'start_date', 'end_date']
    search_fields = ['name', 'project__title']
    date_hierarchy = 'created_at'
    readonly_fields = ['created_at', 'updated_at', 'progress']


@admin.register(SprintTask)
class SprintTaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'sprint', 'assigned_to', 'status', 'due_date', 'priority', 'created_at']
    list_filter = ['status', 'priority', 'sprint', 'assigned_to']
    search_fields = ['title', 'sprint__name']
    date_hierarchy = 'created_at'
    readonly_fields = ['created_at', 'updated_at']


@admin.register(SprintComment)
class SprintCommentAdmin(admin.ModelAdmin):
    list_display = ['sprint', 'user', 'created_at']
    list_filter = ['sprint', 'user', 'created_at']
    search_fields = ['content', 'sprint__name', 'user__username']
    date_hierarchy = 'created_at'
    readonly_fields = ['created_at', 'updated_at']


@admin.register(SprintRetrospective)
class SprintRetrospectiveAdmin(admin.ModelAdmin):
    list_display = ['sprint', 'created_at', 'updated_at']
    list_filter = ['sprint', 'created_at']
    search_fields = ['notes', 'sprint__name']
    date_hierarchy = 'created_at'
    readonly_fields = ['created_at', 'updated_at']
