"""
Utility functions for creating notifications
"""
from .models import Notification
from django.contrib.auth.models import User
from typing import Optional, List


def create_notification(
    user: User,
    notification_type: str,
    title: str,
    message: str,
    related_object_type: Optional[str] = None,
    related_object_id: Optional[int] = None,
    action_url: Optional[str] = None
) -> Notification:
    """
    Create a notification for a user
    
    Args:
        user: User to notify
        notification_type: Type of notification (from Notification.NOTIFICATION_TYPES)
        title: Notification title
        message: Notification message
        related_object_type: Type of related object (e.g., 'task', 'sprint', 'employee')
        related_object_id: ID of related object
        action_url: URL to navigate when notification is clicked
    
    Returns:
        Created Notification object
    """
    return Notification.create_notification(
        user=user,
        type=notification_type,
        title=title,
        message=message,
        related_object_type=related_object_type,
        related_object_id=related_object_id,
        action_url=action_url
    )


def notify_multiple_users(
    users: List[User],
    notification_type: str,
    title: str,
    message: str,
    related_object_type: Optional[str] = None,
    related_object_id: Optional[int] = None,
    action_url: Optional[str] = None
) -> List[Notification]:
    """
    Create notifications for multiple users
    
    Args:
        users: List of users to notify
        notification_type: Type of notification
        title: Notification title
        message: Notification message
        related_object_type: Type of related object
        related_object_id: ID of related object
        action_url: URL to navigate when notification is clicked
    
    Returns:
        List of created Notification objects
    """
    notifications = []
    for user in users:
        notification = Notification.create_notification(
            user=user,
            type=notification_type,
            title=title,
            message=message,
            related_object_type=related_object_type,
            related_object_id=related_object_id,
            action_url=action_url
        )
        notifications.append(notification)
    return notifications


def notify_task_assigned(user: User, task_name: str, task_id: int, assigned_by: str = None):
    """Notify user when a task is assigned to them"""
    title = "New Task Assigned"
    message = f"You have been assigned a new task: {task_name}"
    if assigned_by:
        message += f" by {assigned_by}"
    
    return create_notification(
        user=user,
        notification_type='task_assigned',
        title=title,
        message=message,
        related_object_type='task',
        related_object_id=task_id,
        action_url=f'/tasks'
    )


def notify_task_completed(user: User, task_name: str, task_id: int):
    """Notify user when a task is completed"""
    return create_notification(
        user=user,
        notification_type='task_completed',
        title="Task Completed",
        message=f"Task '{task_name}' has been marked as completed",
        related_object_type='task',
        related_object_id=task_id,
        action_url=f'/tasks'
    )


def notify_sprint_created(user: User, sprint_name: str, sprint_id: int):
    """Notify user when a sprint is created"""
    return create_notification(
        user=user,
        notification_type='sprint_created',
        title="New Sprint Created",
        message=f"A new sprint '{sprint_name}' has been created",
        related_object_type='sprint',
        related_object_id=sprint_id,
        action_url=f'/sprints/{sprint_id}'
    )


def notify_employee_added(user: User, employee_name: str, employee_id: int):
    """Notify user when a new employee is added"""
    return create_notification(
        user=user,
        notification_type='employee_added',
        title="New Employee Added",
        message=f"A new employee '{employee_name}' has been added to the system",
        related_object_type='employee',
        related_object_id=employee_id,
        action_url=f'/employees'
    )


def notify_deadline_approaching(user: User, item_name: str, item_type: str, item_id: int, days_left: int):
    """Notify user when a deadline is approaching"""
    return create_notification(
        user=user,
        notification_type='deadline_approaching',
        title="Deadline Approaching",
        message=f"{item_type.title()} '{item_name}' deadline is in {days_left} day{'s' if days_left > 1 else ''}",
        related_object_type=item_type,
        related_object_id=item_id,
        action_url=f'/{item_type}s'
    )



