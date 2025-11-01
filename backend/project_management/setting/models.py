from django.db import models


class BankAccount(models.Model):
    ACCOUNT_TYPE_CHOICES = [
        ("savings", "Savings"),
        ("current", "Current"),
    ]

    STATUS_CHOICES = [
        ("open", "Open"),
        ("close", "Close"),
    ]

    bank_name = models.CharField(max_length=200)
    account_holder_name = models.CharField(max_length=200)
    account_number = models.CharField(max_length=50)
    account_type = models.CharField(
        max_length=20,
        choices=ACCOUNT_TYPE_CHOICES,
        default="savings"
    )
    branch = models.CharField(max_length=200)
    ifsc_code = models.CharField(max_length=20)
    contact_number = models.CharField(max_length=20)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="open"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Bank Account"
        verbose_name_plural = "Bank Accounts"
    
    def __str__(self):
        return f"{self.account_holder_name} - {self.bank_name}"
