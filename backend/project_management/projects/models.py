from django.db import models
from django.contrib.auth.models import User

class Project(models.Model):
    STATUS_CHOICES = [
        ("not_started", "Not Started"),
        ("planning", "Planning"),
        ("in_progress", "In Progress"),
        ("paused", "Paused"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    ]
    title = models.CharField(max_length=200)
    description = models.TextField()
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    client = models.ForeignKey('clients.Client', on_delete=models.SET_NULL, null=True, related_name='projects')
    budget = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return self.title
