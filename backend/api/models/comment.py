from django.db import models
from django.conf import settings
from .task import Task


class Comment(models.Model):
    """
    Comment model for task collaboration
    """
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    is_edited = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['task', '-created_at']),
            models.Index(fields=['user', '-created_at']),
        ]

    def __str__(self):
        return f"Comment by {self.user.username} on {self.task.title}"

    def save(self, *args, **kwargs):
        # Mark as edited if updating existing comment
        if self.pk and 'content' in kwargs.get('update_fields', []):
            self.is_edited = True
        super().save(*args, **kwargs)


class Notification(models.Model):
    """
    Notification model for user alerts
    """
    NOTIFICATION_TYPES = [
        ('comment', 'New Comment'),
        ('mention', 'Mentioned in Comment'),
        ('task_assigned', 'Task Assigned'),
        ('task_updated', 'Task Updated'),
        ('project_added', 'Added to Project'),
    ]

    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_notifications', null=True, blank=True)
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    task = models.ForeignKey(Task, on_delete=models.CASCADE, null=True, blank=True)
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, null=True, blank=True)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', '-created_at']),
            models.Index(fields=['is_read', '-created_at']),
        ]

    def __str__(self):
        return f"Notification for {self.recipient.username}: {self.notification_type}"


class ActivityLog(models.Model):
    """
    Activity log for tracking project and task changes
    """
    ACTION_TYPES = [
        ('created', 'Created'),
        ('updated', 'Updated'),
        ('deleted', 'Deleted'),
        ('commented', 'Commented'),
        ('status_changed', 'Status Changed'),
        ('assigned', 'Assigned'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='activities')
    action_type = models.CharField(max_length=20, choices=ACTION_TYPES)
    task = models.ForeignKey(Task, on_delete=models.CASCADE, null=True, blank=True, related_name='activities')
    project = models.ForeignKey('Project', on_delete=models.CASCADE, null=True, blank=True, related_name='activities')
    description = models.TextField()
    metadata = models.JSONField(null=True, blank=True)  # Store additional data like old/new values
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['task', '-created_at']),
            models.Index(fields=['project', '-created_at']),
            models.Index(fields=['user', '-created_at']),
        ]

    def __str__(self):
        return f"{self.user.username} {self.action_type} at {self.created_at}"
