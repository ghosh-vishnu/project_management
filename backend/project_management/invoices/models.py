from django.db import models
from projects.models import Project
from clients.models import Client
from setting.models import BankAccount


class Invoice(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("paid", "Paid"),
        ("overdue", "Overdue"),
    ]

    PAYMENT_METHOD_CHOICES = [
        ("online", "Online"),
        ("bank_transaction", "Bank Transaction"),
        ("other", "Other"),
    ]

    invoice_number = models.CharField(
        max_length=50,
        unique=True,
        blank=True,
        null=True,
        help_text="Unique invoice number (e.g., INV-001). Auto-generated if not provided."
    )
    project = models.ForeignKey(
        Project,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='invoices',
        help_text="Project this invoice belongs to"
    )
    client = models.ForeignKey(
        Client,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='invoices',
        help_text="Client this invoice is for"
    )
    amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        help_text="Invoice amount"
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending"
    )
    due_date = models.DateField(
        help_text="Due date for payment"
    )
    address = models.TextField(
        blank=True,
        null=True,
        help_text="Billing address"
    )
    country = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Country"
    )
    phone_number = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        help_text="Contact phone number"
    )
    payment_method = models.CharField(
        max_length=50,
        choices=PAYMENT_METHOD_CHOICES,
        blank=True,
        null=True,
        help_text="Payment method"
    )
    bank_account = models.ForeignKey(
        BankAccount,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='invoices',
        help_text="Bank account for payment"
    )
    note = models.TextField(
        blank=True,
        null=True,
        help_text="Additional notes"
    )
    invoice_file = models.FileField(
        upload_to='invoices/',
        blank=True,
        null=True,
        help_text="Invoice file/document"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-due_date', '-created_at']
        verbose_name = "Invoice"
        verbose_name_plural = "Invoices"
    
    def __str__(self):
        return f"{self.invoice_number} - {self.project.title if self.project else 'N/A'}"
    
    def save(self, *args, **kwargs):
        # Auto-generate invoice number if not provided or empty
        if not self.invoice_number or (isinstance(self.invoice_number, str) and self.invoice_number.strip() == ''):
            last_invoice = Invoice.objects.exclude(invoice_number__isnull=True).exclude(invoice_number='').order_by('-id').first()
            if last_invoice and last_invoice.invoice_number:
                try:
                    last_num = int(last_invoice.invoice_number.split('-')[-1])
                    new_num = last_num + 1
                except (ValueError, IndexError):
                    new_num = 1
            else:
                new_num = 1
            self.invoice_number = f"INV-{str(new_num).zfill(3)}"
        super().save(*args, **kwargs)
