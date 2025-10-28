from django.contrib import admin
from .models import Address, BankDetails, Documents, Employee


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ['address_type', 'city', 'state', 'country']
    search_fields = ['city', 'state']


@admin.register(BankDetails)
class BankDetailsAdmin(admin.ModelAdmin):
    list_display = ['account_holder_name', 'bank_name', 'account_number']
    search_fields = ['account_holder_name', 'bank_name']


@admin.register(Documents)
class DocumentsAdmin(admin.ModelAdmin):
    list_display = ['id']


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'contact_no', 'department', 'designation', 'is_active', 'created_at']
    list_filter = ['is_active', 'department', 'designation']
    search_fields = ['name', 'contact_no', 'pan_no', 'aadhar_no', 'department', 'designation']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Employee Information', {
            'fields': ('user', 'name', 'father_name', 'contact_no', 'alternate_contact_no', 
                      'gender', 'dob', 'joining_date', 'basic_salary', 'is_active')
        }),
        ('Identification', {
            'fields': ('pan_no', 'aadhar_no')
        }),
        ('Organization', {
            'fields': ('department', 'designation')
        }),
        ('Addresses', {
            'fields': ('current_address', 'permanent_address')
        }),
        ('Bank Details', {
            'fields': ('bank_details',)
        }),
        ('Documents', {
            'fields': ('documents',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    def email(self, obj):
        return obj.user.email if obj.user else '-'
    
    email.short_description = 'Email'
