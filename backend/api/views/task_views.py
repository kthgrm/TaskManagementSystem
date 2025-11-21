from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from api.models import Task, Project, ActivityLog, Notification
from api.serializers import TaskSerializer, TaskCreateUpdateSerializer


class TaskViewSet(viewsets.ModelViewSet):
    """ViewSet for Task CRUD operations"""
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter tasks based on user role and project membership"""
        user = self.request.user
        queryset = Task.objects.all()

        # Filter by project if provided
        project_id = self.request.query_params.get('project_id')
        if project_id:
            queryset = queryset.filter(project_id=project_id)

        # Filter by assigned user if provided
        assigned_to = self.request.query_params.get('assigned_to')
        if assigned_to:
            queryset = queryset.filter(assigned_to_id=assigned_to)

        # Filter by status if provided
        task_status = self.request.query_params.get('status')
        if task_status:
            queryset = queryset.filter(status=task_status)

        # Filter by priority if provided
        priority = self.request.query_params.get('priority')
        if priority:
            queryset = queryset.filter(priority=priority)

        # Role-based filtering
        if user.role != 'admin':
            # Show tasks from projects user created, is a member of, or tasks assigned to user
            from django.db.models import Q
            queryset = queryset.filter(
                Q(project__created_by=user) |
                Q(project__members=user) |
                Q(assigned_to=user)
            )

        return queryset.distinct()

    def get_serializer_class(self):
        """Use different serializers for different actions"""
        if self.action in ['create', 'update', 'partial_update']:
            return TaskCreateUpdateSerializer
        return TaskSerializer

    def perform_create(self, serializer):
        """Set the creator when creating a task"""
        task = serializer.save(created_by=self.request.user)
        
        # Create activity log
        ActivityLog.objects.create(
            user=self.request.user,
            action_type='created',
            task=task,
            project=task.project,
            description=f"created task: {task.title}"
        )
        
        # Notify assigned user if set
        if task.assigned_to and task.assigned_to != self.request.user:
            Notification.objects.create(
                recipient=task.assigned_to,
                sender=self.request.user,
                notification_type='task_assigned',
                task=task,
                message=f"{self.request.user.get_full_name()} assigned you to task: {task.title}"
            )
    
    def perform_update(self, serializer):
        """Track task updates and status changes"""
        old_task = self.get_object()
        old_status = old_task.status
        old_assigned_to = old_task.assigned_to
        
        task = serializer.save()
        
        # Create activity log for update
        ActivityLog.objects.create(
            user=self.request.user,
            action_type='updated',
            task=task,
            project=task.project,
            description=f"updated task: {task.title}"
        )
        
        # Check for status change
        if old_status != task.status:
            ActivityLog.objects.create(
                user=self.request.user,
                action_type='status_changed',
                task=task,
                project=task.project,
                description=f"changed status from {old_status} to {task.status}"
            )
            
            # Notify assigned user of status change
            if task.assigned_to and task.assigned_to != self.request.user:
                Notification.objects.create(
                    recipient=task.assigned_to,
                    sender=self.request.user,
                    notification_type='task_updated',
                    task=task,
                    message=f"{self.request.user.get_full_name()} changed task status to {task.status}: {task.title}"
                )
        
        # Check for assignment change
        if old_assigned_to != task.assigned_to:
            if task.assigned_to:
                ActivityLog.objects.create(
                    user=self.request.user,
                    action_type='assigned',
                    task=task,
                    project=task.project,
                    description=f"assigned task to {task.assigned_to.get_full_name()}"
                )
                
                # Notify new assignee
                if task.assigned_to != self.request.user:
                    Notification.objects.create(
                        recipient=task.assigned_to,
                        sender=self.request.user,
                        notification_type='task_assigned',
                        task=task,
                        message=f"{self.request.user.get_full_name()} assigned you to task: {task.title}"
                    )

    @action(detail=False, methods=['get'])
    def my_tasks(self, request):
        """Get tasks assigned to current user"""
        tasks = Task.objects.filter(assigned_to=request.user)
        serializer = self.get_serializer(tasks, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_project(self, request):
        """Get tasks by project ID"""
        project_id = request.query_params.get('project_id')
        if not project_id:
            return Response({
                'error': 'project_id parameter is required'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            project = Project.objects.get(id=project_id)
            # Check if user has access to this project
            user = request.user
            if user.role != 'admin' and user != project.created_by and user not in project.members.all():
                return Response({
                    'error': 'You do not have access to this project'
                }, status=status.HTTP_403_FORBIDDEN)

            tasks = Task.objects.filter(project=project)
            serializer = self.get_serializer(tasks, many=True)
            return Response(serializer.data)
        except Project.DoesNotExist:
            return Response({
                'error': 'Project not found'
            }, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def assign(self, request, pk=None):
        """Assign task to a user"""
        task = self.get_object()
        user_id = request.data.get('user_id')

        if not user_id:
            return Response({
                'error': 'user_id is required'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            from api.models import User
            user = User.objects.get(id=user_id)
            # Check if user is a member of the project
            if user not in task.project.members.all():
                return Response({
                    'error': 'User is not a member of this project'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            task.assigned_to = user
            task.save()
            return Response({
                'message': f'Task assigned to {user.username} successfully',
                'task': TaskSerializer(task).data
            }, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({
                'error': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)
