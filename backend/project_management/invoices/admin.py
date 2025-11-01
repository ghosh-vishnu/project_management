from django.contrib import admin
from .models import Invoice


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ['invoice_number', 'project', 'client', 'amount', 'status', 'due_date', 'created_at']
    list_filter = ['status', 'payment_method', 'due_date', 'project', 'client']
    search_fields = ['invoice_number', 'project__title', 'client__name']
    date_hierarchy = 'due_date'
    ordering = ['-due_date', '-created_at']
    readonly_fields = ['created_at', 'updated_at']

