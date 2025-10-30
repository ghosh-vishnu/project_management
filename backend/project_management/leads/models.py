from django.db import models
from employee.models import Employee


class Lead(models.Model):
    """Represents a sales lead assigned to an employee."""
    STATUS_CHOICES = (
        ('New', 'New'),
        ('Discussion', 'Discussion'),
        ('Won', 'Won'),
        ('Lost', 'Lost'),
    )

    name = models.CharField(max_length=255)
    email = models.EmailField()
    contact = models.CharField(max_length=30)
    lead_source = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='New')
    description = models.TextField(blank=True)

    # Assignment
    assign_to = models.ForeignKey(
        Employee,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_leads'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self) -> str:  # pragma: no cover - simple representation
        return f"Lead({self.name})"
