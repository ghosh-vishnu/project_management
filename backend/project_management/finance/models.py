from django.db import models
from projects.models import Project
from clients.models import Client
from setting.models import BankAccount
from employee.models import Employee


class Income(models.Model):
    PAYMENT_MODE_CHOICES = [
        ("upi", "UPI"),
        ("credit_card", "Credit Card"),
        ("debit_card", "Debit Card"),
        ("cash", "Cash"),
        ("others", "Others"),
    ]

    client = models.ForeignKey(
        Client,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='incomes',
        help_text="Client associated with this income"
    )
    project = models.ForeignKey(
        Project,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='incomes',
        help_text="Project associated with this income"
    )
    amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        help_text="Income amount"
    )
    payment_mode = models.CharField(
        max_length=20,
        choices=PAYMENT_MODE_CHOICES,
        default="cash"
    )
    payment_id = models.CharField(
        max_length=200,
        help_text="Payment transaction ID or reference number"
    )
    income_date = models.DateField(
        help_text="Date when income was received"
    )
    bank_account = models.ForeignKey(
        BankAccount,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='incomes',
        help_text="Bank account where income was received"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-income_date', '-created_at']
        verbose_name = "Income"
        verbose_name_plural = "Incomes"
    
    def __str__(self):
        return f"₹{self.amount} - {self.income_date}"


class Expense(models.Model):
    PAYMENT_MODE_CHOICES = [
        ("upi", "UPI"),
        ("credit_card", "Credit Card"),
        ("debit_card", "Debit Card"),
        ("cash", "Cash"),
        ("others", "Others"),
    ]

    name = models.CharField(
        max_length=255,
        help_text="Name/description of the expense"
    )
    amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        help_text="Expense amount"
    )
    date = models.DateField(
        help_text="Date when expense occurred"
    )
    purchased_by = models.ForeignKey(
        Employee,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='expenses',
        help_text="Employee who made the purchase"
    )
    purchased_from = models.CharField(
        max_length=255,
        help_text="Vendor or source where purchase was made"
    )
    bank_account = models.ForeignKey(
        BankAccount,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='expenses',
        help_text="Bank account from which expense was paid"
    )
    payment_mode = models.CharField(
        max_length=20,
        choices=PAYMENT_MODE_CHOICES,
        default="cash"
    )
    payment_id = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        help_text="Payment transaction ID or reference number"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-date', '-created_at']
        verbose_name = "Expense"
        verbose_name_plural = "Expenses"
    
    def __str__(self):
        return f"{self.name} - ₹{self.amount}"
