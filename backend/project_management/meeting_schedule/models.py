from django.db import models
from django.conf import settings


class Meeting(models.Model):
    STATUS_CHOICES = (
        ("scheduled", "Scheduled"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    )

    name = models.CharField(max_length=255)
    start_at = models.DateTimeField()
    meeting_link = models.URLField(blank=True, null=True)
    duration_minutes = models.PositiveIntegerField(default=30)

    # who scheduled this meeting (User)
    scheduled_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="scheduled_meetings",
    )

    # optional notes
    note = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="scheduled")

    # attendees: many Users
    attendees = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name="meetings",
        blank=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-start_at", "-created_at"]

    def __str__(self) -> str:
        return self.name
