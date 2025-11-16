from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from api.models import Task, Project
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
            # Show tasks from projects user is part of or tasks assigned to user
            queryset = queryset.filter(
                project__members=user
            ) | queryset.filter(assigned_to=user)

        return queryset.distinct()

    def get_serializer_class(self):
        """Use different serializers for different actions"""
        if self.action in ['create', 'update', 'partial_update']:
            return TaskCreateUpdateSerializer
        return TaskSerializer

    def perform_create(self, serializer):
        """Set the creator when creating a task"""
        serializer.save(created_by=self.request.user)

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
