from django.contrib import admin
from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'type', 'read', 'created_at']
    list_filter = ['type', 'read', 'created_at']
    search_fields = ['title', 'message', 'user__username', 'user__email']
    readonly_fields = ['created_at', 'read_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Notification Details', {
            'fields': ('user', 'type', 'title', 'message')
        }),
        ('Status', {
            'fields': ('read', 'read_at', 'created_at')
        }),
        ('Related Object', {
            'fields': ('related_object_type', 'related_object_id', 'action_url'),
            'classes': ('collapse',)
        }),
    )
