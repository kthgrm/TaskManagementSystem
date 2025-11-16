from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.reverse import reverse


@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request, format=None):
    """
    TMS API
    
    This endpoint provides:
    - API version information
    - Hyperlinked navigation to all major API resources
    - Authentication status
    - Available actions based on user permissions
    """
    # Check authentication status
    is_authenticated = request.user and request.user.is_authenticated
    
    response_data = {
        'message': 'Welcome to Task Management System API',
        'version': '1.0.0',
        'authenticated': is_authenticated,
        'user': request.user.username if is_authenticated else None,
        'endpoints': {
            'users': {
                'list': reverse('user-list', request=request, format=format),
                'register': reverse('user-register', request=request, format=format),
                'login': reverse('user-login', request=request, format=format),
            },
            'projects': {
                'list': reverse('project-list', request=request, format=format),
            },
            'tasks': {
                'list': reverse('task-list', request=request, format=format),
            },
        },
        'links': {
            'documentation': request.build_absolute_uri('/') + 'api/',
            'admin': request.build_absolute_uri('/admin/'),
        },
    }
    
    # Add authenticated-only endpoints
    if is_authenticated:
        response_data['endpoints']['users']['profile'] = reverse(
            'user-profile', request=request, format=format
        )
        response_data['endpoints']['users']['logout'] = reverse(
            'user-logout', request=request, format=format
        )
        response_data['endpoints']['tasks']['my_tasks'] = reverse(
            'task-my-tasks', request=request, format=format
        )
    
    return Response(response_data)
