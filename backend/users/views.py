from django.shortcuts import render
from django.db.models import Count, Q
from django.contrib.auth.models import User
from authentication.models import Profile
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status, permissions
from rest_framework.pagination import PageNumberPagination


from .permissions import IsAdmin
from authentication.serializers import UserSerializer


class AdminUserListView(generics.ListAPIView):
    """
    API endpoint for admin to list all users
    GET /api/users/admin/users/
    """
    queryset = User.objects.all().select_related('profile')
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]
    pagination_class = PageNumberPagination
    
    def get_queryset(self):
        queryset = super().get_queryset()
        # Filter by role if provided
        role = self.request.query_params.get('role', None)
        if role:
            queryset = queryset.filter(profile__role=role)
        
        # Search by username or email
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(username__icontains=search) |
                Q(email__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search)
            )
        
        return queryset.order_by('-date_joined')


class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    API endpoint for admin to view, update, or delete a specific user
    GET/PUT/PATCH/DELETE /api/users/admin/users/<id>/
    """
    queryset = User.objects.all().select_related('profile')
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]
    
    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        username = user.username
        user.delete()
        return Response({
            'message': f'User {username} deleted successfully'
        }, status=status.HTTP_200_OK)


class AdminUpdateUserRoleView(APIView):
    """
    API endpoint for admin to update user role
    POST /api/users/admin/users/<id>/role/
    """
    permission_classes = [IsAdmin]
    
    def post(self, request, pk):
        try:
            user = User.objects.select_related('profile').get(pk=pk)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        new_role = request.data.get('role')
        if new_role not in ['user', 'admin']:
            return Response(
                {'error': 'Invalid role. Must be "user" or "admin"'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.profile.role = new_role
        user.profile.save()
        
        return Response({
            'message': f'User role updated to {new_role}',
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)


class AdminStatsView(APIView):
    """
    API endpoint for admin to get system statistics
    GET /api/users/admin/stats/
    """
    permission_classes = [IsAdmin]
    
    def get(self, request):        
        total_users = User.objects.count()
        admin_users = Profile.objects.filter(role='admin').count()
        regular_users = Profile.objects.filter(role='user').count()
        active_users = User.objects.filter(is_active=True).count()
        inactive_users = User.objects.filter(is_active=False).count()
        
        return Response({
            'total_users': total_users,
            'admin_users': admin_users,
            'regular_users': regular_users,
            'active_users': active_users,
            'inactive_users': inactive_users,
        }, status=status.HTTP_200_OK)