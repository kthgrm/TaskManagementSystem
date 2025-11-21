from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
import re
from api.models import Comment, Notification, ActivityLog, Task
from api.serializers import CommentSerializer, NotificationSerializer, ActivityLogSerializer


class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        
        # Admin can see all comments
        if user.role == 'admin':
            queryset = Comment.objects.all()
        else:
            # Users can see comments on tasks in projects they created or are members of
            queryset = Comment.objects.filter(
                Q(task__project__members=user) | Q(task__project__created_by=user)
            )
        
        # Filter by task if provided
        task_id = self.request.query_params.get('task', None)
        if task_id:
            queryset = queryset.filter(task_id=task_id)
        
        # Only return top-level comments for list action (replies are nested in serializer)
        # Don't apply this filter for detail actions (retrieve, update, destroy)
        if self.action == 'list':
            queryset = queryset.filter(parent__isnull=True)
        
        return queryset.select_related('user', 'task').prefetch_related('replies__user')

    def perform_create(self, serializer):
        comment = serializer.save(user=self.request.user)
        
        # Create activity log
        ActivityLog.objects.create(
            user=self.request.user,
            action_type='commented',
            task=comment.task,
            project=comment.task.project,
            description=f"commented on task: {comment.task.title}"
        )
        
        # Check for mentions (@username) in comment content
        self._process_mentions(comment)
        
        # Notify task assignee if not the commenter
        if comment.task.assigned_to and comment.task.assigned_to != self.request.user:
            Notification.objects.create(
                recipient=comment.task.assigned_to,
                sender=self.request.user,
                notification_type='comment',
                task=comment.task,
                comment=comment,
                message=f"{self.request.user.get_full_name()} commented on task: {comment.task.title}"
            )

    def perform_update(self, serializer):
        serializer.save(is_edited=True)

    def _process_mentions(self, comment):
        """Process @mentions in comment content and create notifications"""
        mention_pattern = r'@(\w+)'
        mentioned_usernames = re.findall(mention_pattern, comment.content)
        
        if mentioned_usernames:
            from api.models import User
            for username in mentioned_usernames:
                try:
                    mentioned_user = User.objects.get(username=username)
                    if mentioned_user != self.request.user:
                        Notification.objects.create(
                            recipient=mentioned_user,
                            sender=self.request.user,
                            notification_type='mention',
                            task=comment.task,
                            comment=comment,
                            message=f"{self.request.user.get_full_name()} mentioned you in a comment"
                        )
                except User.DoesNotExist:
                    continue


class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Notification.objects.filter(recipient=user)
        
        # Filter by read status
        is_read = self.request.query_params.get('is_read', None)
        if is_read is not None:
            queryset = queryset.filter(is_read=is_read.lower() == 'true')
        
        return queryset.select_related('sender', 'task', 'comment')

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Mark all notifications as read for the current user"""
        updated = Notification.objects.filter(
            recipient=request.user,
            is_read=False
        ).update(is_read=True)
        
        return Response({
            'message': f'{updated} notifications marked as read'
        })

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark a specific notification as read"""
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        
        return Response({
            'message': 'Notification marked as read'
        })

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Get count of unread notifications"""
        count = Notification.objects.filter(
            recipient=request.user,
            is_read=False
        ).count()
        
        return Response({'count': count})


class ActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        
        # Filter by project if provided
        project_id = self.request.query_params.get('project', None)
        if project_id:
            if user.role == 'admin':
                queryset = ActivityLog.objects.filter(project_id=project_id)
            else:
                queryset = ActivityLog.objects.filter(
                    Q(project_id=project_id) & 
                    (Q(project__members=user) | Q(project__created_by=user))
                )
        # Filter by task if provided
        elif self.request.query_params.get('task', None):
            task_id = self.request.query_params.get('task')
            if user.role == 'admin':
                queryset = ActivityLog.objects.filter(task_id=task_id)
            else:
                queryset = ActivityLog.objects.filter(
                    Q(task_id=task_id) & 
                    (Q(task__project__members=user) | Q(task__project__created_by=user))
                )
        # Return all activities for user's projects
        else:
            if user.role == 'admin':
                queryset = ActivityLog.objects.all()
            else:
                queryset = ActivityLog.objects.filter(
                    Q(project__members=user) | Q(project__created_by=user) |
                    Q(task__project__members=user) | Q(task__project__created_by=user)
                )
        
        return queryset.select_related('user', 'task', 'project')
