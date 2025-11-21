from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from api.models import Project
from api.serializers import ProjectSerializer, ProjectCreateUpdateSerializer


class ProjectViewSet(viewsets.ModelViewSet):
    """ViewSet for Project CRUD operations"""
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter projects based on user role and membership"""
        user = self.request.user
        if user.role == 'admin':
            return Project.objects.all()
        # Return projects created by user or where user is a member
        return  Project.objects.filter(members=user)

    def get_serializer_class(self):
        """Use different serializers for different actions"""
        if self.action in ['create', 'update', 'partial_update']:
            return ProjectCreateUpdateSerializer
        return ProjectSerializer

    def perform_create(self, serializer):
        """Set the creator when creating a project"""
        # Allow admin to specify created_by, otherwise use request.user
        created_by = serializer.validated_data.get('created_by', self.request.user)
        project = serializer.save(created_by=created_by)
        # Add creator as a member automatically if not already in members
        if created_by not in project.members.all():
            project.members.add(created_by)

    def perform_update(self, serializer):
        """Update project and handle created_by change"""
        # If created_by is being changed, update the members list
        old_creator = serializer.instance.created_by
        new_creator = serializer.validated_data.get('created_by', old_creator)
        
        project = serializer.save()
        
        # Add new creator to members if not already there
        if new_creator and new_creator not in project.members.all():
            project.members.add(new_creator)

    @action(detail=True, methods=['post'])
    def add_member(self, request, pk=None):
        """Add a member to the project"""
        project = self.get_object()
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response({
                'error': 'user_id is required'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            from api.models import User
            user = User.objects.get(id=user_id)
            project.members.add(user)
            return Response({
                'message': f'User {user.username} added to project successfully'
            }, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({
                'error': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def remove_member(self, request, pk=None):
        """Remove a member from the project"""
        project = self.get_object()
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response({
                'error': 'user_id is required'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            from api.models import User
            user = User.objects.get(id=user_id)
            project.members.remove(user)
            return Response({
                'message': f'User {user.username} removed from project successfully'
            }, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({
                'error': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)
