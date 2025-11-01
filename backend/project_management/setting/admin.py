from django.contrib import admin
from .models import BankAccount


@admin.register(BankAccount)
class BankAccountAdmin(admin.ModelAdmin):
    list_display = ['account_holder_name', 'bank_name', 'account_number', 'account_type', 'branch', 'status', 'created_at']
    list_filter = ['status', 'account_type', 'created_at']
    search_fields = ['account_holder_name', 'bank_name', 'account_number', 'ifsc_code']
    date_hierarchy = 'created_at'
    ordering = ['-created_at']
