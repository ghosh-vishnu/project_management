from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class Notification(models.Model):
    """Notification model for real-time user notifications"""
    
    NOTIFICATION_TYPES = [
        ('task_assigned', 'Task Assigned'),
        ('task_completed', 'Task Completed'),
        ('task_updated', 'Task Updated'),
        ('sprint_created', 'Sprint Created'),
        ('sprint_updated', 'Sprint Updated'),
        ('employee_added', 'Employee Added'),
        ('employee_updated', 'Employee Updated'),
        ('project_created', 'Project Created'),
        ('project_updated', 'Project Updated'),
        ('meeting_scheduled', 'Meeting Scheduled'),
        ('deadline_approaching', 'Deadline Approaching'),
        ('comment_added', 'Comment Added'),
        ('system', 'System Notification'),
        ('info', 'Info'),
        ('warning', 'Warning'),
        ('success', 'Success'),
    ]
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    type = models.CharField(
        max_length=50,
        choices=NOTIFICATION_TYPES,
        default='info'
    )
    title = models.CharField(max_length=200)
    message = models.TextField()
    read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    related_object_type = models.CharField(max_length=50, blank=True, null=True)
    related_object_id = models.IntegerField(blank=True, null=True)
    action_url = models.CharField(max_length=500, blank=True, null=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'read']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.user.username}"
    
    def mark_as_read(self):
        """Mark notification as read"""
        if not self.read:
            self.read = True
            self.read_at = timezone.now()
            self.save(update_fields=['read', 'read_at'])
    
    @classmethod
    def create_notification(cls, user, type, title, message, related_object_type=None, related_object_id=None, action_url=None):
        """Helper method to create a notification"""
        notification = cls.objects.create(
            user=user,
            type=type,
            title=title,
            message=message,
            related_object_type=related_object_type,
            related_object_id=related_object_id,
            action_url=action_url
        )
        return notification
