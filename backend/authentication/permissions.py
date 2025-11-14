from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
    """
    Custom permission to only allow admin users.
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            hasattr(request.user, 'profile') and
            request.user.profile.is_admin
        )


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to allow admin users full access,
    and regular users read-only access.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        
        return (
            request.user and 
            request.user.is_authenticated and 
            hasattr(request.user, 'profile') and
            request.user.profile.is_admin
        )


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Custom permission to allow owners or admin users to access the object.
    """
    def has_object_permission(self, request, view, obj):
        # Admin can access anything
        if hasattr(request.user, 'profile') and request.user.profile.is_admin:
            return True
        
        # Check if the object has a user attribute
        if hasattr(obj, 'user'):
            return obj.user == request.user
        
        # Otherwise, check if obj is the user itself
        return obj == request.user
