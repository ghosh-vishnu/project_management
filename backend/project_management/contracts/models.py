from django.db import models
from leads.models import Lead


class Contract(models.Model):
    """Represents a contract linked to a lead."""
    STATUS_CHOICES = (
        ("Pending", "Pending"),
        ("Active", "Active"),
        ("Completed", "Completed"),
        ("Cancelled", "Cancelled"),
    )

    name = models.CharField(max_length=255)
    lead_name = models.ForeignKey(Lead, on_delete=models.SET_NULL, null=True, blank=True, related_name='contracts')
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    description = models.TextField(blank=True)
    budget = models.DecimalField(max_digits=12, decimal_places=2)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self) -> str:  # pragma: no cover
        return f"Contract({self.name})"


