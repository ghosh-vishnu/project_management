from django.contrib import admin
from .models import Income, Expense


@admin.register(Income)
class IncomeAdmin(admin.ModelAdmin):
    list_display = ['id', 'client', 'project', 'amount', 'payment_mode', 'income_date', 'bank_account', 'created_at']
    list_filter = ['payment_mode', 'income_date', 'created_at', 'client', 'project']
    search_fields = ['payment_id', 'client__name', 'project__title']
    date_hierarchy = 'income_date'
    ordering = ['-income_date', '-created_at']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ['name', 'amount', 'date', 'purchased_by', 'purchased_from', 'payment_mode', 'bank_account', 'created_at']
    list_filter = ['payment_mode', 'date', 'purchased_by', 'bank_account']
    search_fields = ['name', 'purchased_from', 'payment_id']
    date_hierarchy = 'date'
    ordering = ['-date', '-created_at']
    readonly_fields = ['created_at', 'updated_at']
