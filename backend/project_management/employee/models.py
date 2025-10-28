from django.db import models
from django.contrib.auth.models import User


class Department(models.Model):
    title = models.CharField(max_length=200, unique=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class Designation(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='designations', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class Address(models.Model):
    ADDRESS_TYPE_CHOICES = [
        ('current', 'Current Address'),
        ('permanent', 'Permanent Address'),
    ]
    
    address_type = models.CharField(max_length=20, choices=ADDRESS_TYPE_CHOICES)
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    pincode = models.CharField(max_length=10)
    
    def __str__(self):
        return f"{self.address_type} - {self.city}, {self.state}"


class BankDetails(models.Model):
    account_holder_name = models.CharField(max_length=200)
    account_number = models.CharField(max_length=50)
    bank_name = models.CharField(max_length=200)
    ifsc_code = models.CharField(max_length=20)
    branch = models.CharField(max_length=200)
    
    def __str__(self):
        return f"{self.account_holder_name} - {self.bank_name}"


class Documents(models.Model):
    photo = models.ImageField(upload_to='employee_documents/photos/', blank=True, null=True)
    resume = models.FileField(upload_to='employee_documents/resumes/', blank=True, null=True)
    aadhar_card = models.FileField(upload_to='employee_documents/aadhar/', blank=True, null=True)
    pan_card = models.FileField(upload_to='employee_documents/pan/', blank=True, null=True)
    higher_education_certificate = models.FileField(upload_to='employee_documents/education/', blank=True, null=True)
    
    def __str__(self):
        return f"Documents for {self.employee.name if hasattr(self, 'employee') else 'Employee' }"


class Employee(models.Model):
    GENDER_CHOICES = [
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Others', 'Others'),
    ]
    
    # One-to-One relationship with User for login credentials
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='employee_profile')
    
    # Employee Details
    name = models.CharField(max_length=200)
    father_name = models.CharField(max_length=200)
    contact_no = models.CharField(max_length=20)
    alternate_contact_no = models.CharField(max_length=20, blank=True, null=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    pan_no = models.CharField(max_length=20, unique=True)
    aadhar_no = models.CharField(max_length=20, unique=True)
    dob = models.DateField(blank=True, null=True)
    joining_date = models.DateField()
    basic_salary = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)
    
    # Department and Designation - Simple text fields
    department = models.CharField(max_length=200, blank=True, null=True)
    designation = models.CharField(max_length=200, blank=True, null=True)
    
    # Related Models
    current_address = models.OneToOneField(Address, on_delete=models.CASCADE, related_name='current_employee', null=True, blank=True)
    permanent_address = models.OneToOneField(Address, on_delete=models.CASCADE, related_name='permanent_employee', null=True, blank=True)
    bank_details = models.OneToOneField(BankDetails, on_delete=models.CASCADE, null=True, blank=True)
    documents = models.OneToOneField(Documents, on_delete=models.CASCADE, null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name
