from django.db import models
from projects.models import Project


class ToDo(models.Model):
    PRIORITY_CHOICES = [
        ("highest", "Highest"),
        ("high", "High"),
        ("medium", "Medium"),
        ("low", "Low"),
        ("lowest", "Lowest"),
    ]

    STATUS_CHOICES = [
        ("not_started", "Not Started"),
        ("planning", "Planning"),
        ("in_progress", "In Progress"),
        ("paused", "Paused"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    ]

    todo_name = models.CharField(max_length=200)
    project = models.ForeignKey(
        Project, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='todos',
        help_text="Project this todo belongs to"
    )
    priority = models.CharField(
        max_length=20, 
        choices=PRIORITY_CHOICES, 
        default="medium"
    )
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default="not_started"
    )
    start_date = models.DateField()
    end_date = models.DateField()
    description = models.TextField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "ToDo"
        verbose_name_plural = "ToDos"
    
    def __str__(self):
        return self.todo_name

