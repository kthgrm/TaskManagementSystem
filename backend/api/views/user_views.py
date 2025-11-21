from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, BasePermission
from django.contrib.auth import login, logout
from django.db.models import Count
from api.models import User, Project, Task
from api.serializers import (
    UserSerializer, 
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserProfileSerializer
)


class IsAdmin(BasePermission):
    """Permission class to check if user is admin"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'admin'


class UserViewSet(viewsets.ModelViewSet):
    """ViewSet for User CRUD operations"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        """Allow public access to register and login, admin for CRUD"""
        if self.action in ['register', 'login']:
            return [AllowAny()]
        elif self.action in ['list', 'create', 'update', 'partial_update', 'destroy']:
            return [IsAdmin()]
        return super().get_permissions()

    def get_queryset(self):
        """Filter users based on role"""
        user = self.request.user
        if user.role == 'admin':
            # Annotate with project and task counts
            return User.objects.annotate(
                project_count=Count('created_projects', distinct=True) + Count('projects', distinct=True),
                task_count=Count('assigned_tasks', distinct=True)
            ).all()
        return User.objects.filter(id=user.id)

    def list(self, request):
        """List all users with statistics"""
        queryset = self.get_queryset()
        users_data = []
        
        for user in queryset:
            # Calculate statistics
            created_projects = Project.objects.filter(created_by=user).count()
            member_projects = user.projects.count()
            total_projects = created_projects + member_projects
            assigned_tasks = Task.objects.filter(assigned_to=user).count()
            
            user_dict = UserSerializer(user).data
            user_dict['project_count'] = total_projects
            user_dict['task_count'] = assigned_tasks
            user_dict['status'] = 'active' if user.is_active else 'inactive'
            user_dict['full_name'] = f"{user.first_name} {user.last_name}".strip() or user.username
            users_data.append(user_dict)
        
        return Response(users_data)

    def create(self, request):
        """Create a new user (admin only)"""
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'message': 'User created successfully',
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
        """Update user (admin only)"""
        try:
            user = User.objects.get(pk=pk)
            
            # Update fields
            user.username = request.data.get('username', user.username)
            user.email = request.data.get('email', user.email)
            user.first_name = request.data.get('first_name', user.first_name)
            user.last_name = request.data.get('last_name', user.last_name)
            user.phone = request.data.get('phone', user.phone)
            user.role = request.data.get('role', user.role)
            user.is_active = request.data.get('is_active', user.is_active)
            
            # Update password if provided
            password = request.data.get('password')
            if password:
                user.set_password(password)
            
            user.save()
            
            return Response({
                'message': 'User updated successfully',
                'user': UserSerializer(user).data
            })
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    def partial_update(self, request, pk=None):
        """Partial update user"""
        return self.update(request, pk)

    def destroy(self, request, pk=None):
        """Delete user (admin only)"""
        try:
            user = User.objects.get(pk=pk)
            
            # Prevent self-deletion
            if user.id == request.user.id:
                return Response({
                    'error': 'You cannot delete your own account'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if user has active projects or tasks
            created_projects = Project.objects.filter(created_by=user).count()
            assigned_tasks = Task.objects.filter(assigned_to=user).count()
            
            if created_projects > 0 or assigned_tasks > 0:
                # Soft delete by deactivating
                user.is_active = False
                user.save()
                return Response({
                    'message': f'User deactivated (has {created_projects} projects and {assigned_tasks} tasks)'
                })
            else:
                # Hard delete if no dependencies
                username = user.username
                user.delete()
                return Response({
                    'message': f'User {username} deleted successfully'
                }, status=status.HTTP_204_NO_CONTENT)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def register(self, request):
        """Register a new user"""
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'message': 'User registered successfully',
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def login(self, request):
        """Login a user"""
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            login(request, user)
            return Response({
                'message': 'Login successful',
                'user': UserProfileSerializer(user).data
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def logout(self, request):
        """Logout a user"""
        logout(request)
        return Response({
            'message': 'Logout successful'
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get', 'put', 'patch'])
    def profile(self, request):
        """Get or update user profile"""
        user = request.user
        if request.method == 'GET':
            serializer = UserProfileSerializer(user)
            return Response(serializer.data)
        
        serializer = UserProfileSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Profile updated successfully',
                'user': serializer.data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def toggle_status(self, request, pk=None):
        """Toggle user active status"""
        try:
            user = User.objects.get(pk=pk)
            user.is_active = not user.is_active
            user.save()
            return Response({
                'message': f'User {"activated" if user.is_active else "deactivated"} successfully',
                'user': UserSerializer(user).data
            })
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'])
    def available(self, request):
        """Get list of available users (for adding to projects)"""
        # Get all active users with role 'user'
        users = User.objects.filter(is_active=True, role='user')
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)
