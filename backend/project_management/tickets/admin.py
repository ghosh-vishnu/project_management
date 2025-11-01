from django.contrib import admin
from .models import Ticket


@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ['title', 'project', 'client', 'assigned_to', 'priority', 'status', 'created_at']
    list_filter = ['priority', 'status', 'project', 'client', 'created_at']
    search_fields = ['title', 'description']
    date_hierarchy = 'created_at'
    ordering = ['-created_at']
