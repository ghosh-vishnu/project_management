from django.db import models


class Proposal(models.Model):
    """Represents a sales proposal."""

    STATUS_CHOICES = (
        ("Pending", "Pending"),
        ("Active", "Active"),
        ("Completed", "Completed"),
        ("Cancelled", "Cancelled"),
    )

    proposal_value = models.CharField(max_length=255)
    client_lead = models.EmailField()
    proposal_date = models.DateField()
    valid_until = models.DateField()
    proposal_title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Pending")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self) -> str:  # pragma: no cover
        return f"Proposal({self.proposal_title})"
