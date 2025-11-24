from django.db import models
from django.contrib.auth.models import User
from projects.models import Project
from django.utils import timezone


class Sprint(models.Model):
    STATUS_CHOICES = [
        ("active", "Active"),
        ("completed", "Completed"),
        ("upcoming", "Upcoming"),
    ]
    
    name = models.CharField(max_length=200)
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='sprints',
        help_text="Project this sprint belongs to"
    )
    start_date = models.DateField()
    end_date = models.DateField()
    progress = models.IntegerField(default=0, help_text="Progress percentage (0-100)")
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="upcoming"
    )
    description = models.TextField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Sprint"
        verbose_name_plural = "Sprints"
    
    def __str__(self):
        return self.name
    
    def calculate_progress(self):
        """Calculate progress based on completed tasks"""
        total_tasks = self.tasks.count()
        if total_tasks == 0:
            return 0
        completed_tasks = self.tasks.filter(status="done").count()
        return int((completed_tasks / total_tasks) * 100)
    
    def get_remaining_days(self):
        """Calculate remaining days until end date"""
        today = timezone.now().date()
        if self.end_date < today:
            return 0
        return (self.end_date - today).days
    
    def update_status(self):
        """Update status based on dates"""
        today = timezone.now().date()
        if today < self.start_date:
            self.status = "upcoming"
        elif today > self.end_date:
            self.status = "completed"
        else:
            self.status = "active"
        self.save()


class SprintTask(models.Model):
    STATUS_CHOICES = [
        ("todo", "To Do"),
        ("pending", "Pending"),
        ("in_progress", "In Progress"),
        ("in_review", "In Review"),
        ("done", "Done"),
    ]
    
    sprint = models.ForeignKey(
        Sprint,
        on_delete=models.CASCADE,
        related_name='tasks',
        help_text="Sprint this task belongs to"
    )
    title = models.CharField(max_length=200)
    assigned_to = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sprint_tasks',
        help_text="User assigned to this task"
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="todo"
    )
    due_date = models.DateField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    priority = models.CharField(
        max_length=20,
        choices=[("low", "Low"), ("medium", "Medium"), ("high", "High")],
        default="medium"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['created_at']
        verbose_name = "Sprint Task"
        verbose_name_plural = "Sprint Tasks"
    
    def __str__(self):
        return self.title


class SprintComment(models.Model):
    sprint = models.ForeignKey(
        Sprint,
        on_delete=models.CASCADE,
        related_name='comments',
        help_text="Sprint this comment belongs to"
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='sprint_comments',
        help_text="User who made the comment"
    )
    content = models.TextField()
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Sprint Comment"
        verbose_name_plural = "Sprint Comments"
    
    def __str__(self):
        return f"Comment by {self.user.username} on {self.sprint.name}"


class SprintRetrospective(models.Model):
    sprint = models.OneToOneField(
        Sprint,
        on_delete=models.CASCADE,
        related_name='retrospective',
        help_text="Sprint this retrospective belongs to"
    )
    notes = models.TextField(
        help_text="Sprint summary, feedback, and retrospective notes"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Sprint Retrospective"
        verbose_name_plural = "Sprint Retrospectives"
    
    def __str__(self):
        return f"Retrospective for {self.sprint.name}"
