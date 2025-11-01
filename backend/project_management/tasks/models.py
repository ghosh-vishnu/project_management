from django.db import models
from django.contrib.auth.models import User
from projects.models import Project
from employee.models import Employee


class Task(models.Model):
    PRIORITY_CHOICES = [
        ("highest", "Highest"),
        ("high", "High"),
        ("medium", "Medium"),
        ("low", "Low"),
        ("lowest", "Lowest"),
    ]

    STATUS_CHOICES = [
        ("todo", "To Do"),
        ("in_progress", "In Progress"),
        ("review", "Review"),
        ("testing", "Testing"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    ]

    task_name = models.CharField(max_length=200)
    project = models.ForeignKey(
        Project, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='tasks',
        help_text="Project this task belongs to"
    )
    assigned_to = models.ForeignKey(
        Employee,
        on_delete=models.SET_NULL,
        null=True,
        related_name='assigned_tasks',
        help_text="Employee assigned to this task"
    )
    priority = models.CharField(
        max_length=20, 
        choices=PRIORITY_CHOICES, 
        default="medium"
    )
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default="todo"
    )
    start_date = models.DateField()
    end_date = models.DateField()
    description = models.TextField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Task"
        verbose_name_plural = "Tasks"
    
    def __str__(self):
        return self.task_name
