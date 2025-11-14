from django.contrib.auth.models import User
from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import ValidationError

from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserSerializer,
    UserProfileUpdateSerializer,
    ChangePasswordSerializer
)

class UserRegistrationView(generics.CreateAPIView):
    """
    API endpoint for user registration
    POST /api/auth/register/
    Token is automatically created via signal
    """
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Token is automatically created by the post_save signal
        token = Token.objects.get(user=user)
        
        return Response({
            'message': 'User registered successfully',
            'user': UserSerializer(user).data,
            'token': token.key
        }, status=status.HTTP_201_CREATED)


class UserLoginView(APIView):
    """
    API endpoint for user login
    POST /api/auth/login/
    Supports login via username or email
    Returns authentication token for stateless authentication
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        
        # Get or create token for stateless authentication
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'message': 'Login successful',
            'user': UserSerializer(user).data,
            'token': token.key
        }, status=status.HTTP_200_OK)


class UserLogoutView(APIView):
    """
    API endpoint for user logout
    POST /api/auth/logout/
    Deletes the user's authentication token
    """
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def post(self, request):
        # Delete the user's token for stateless logout
        try:
            request.user.auth_token.delete()
            return Response({
                'message': 'Logout successful'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'error': 'Failed to logout'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    API endpoint to view and edit user profile
    GET /api/auth/profile/
    PUT/PATCH /api/auth/profile/
    """
    serializer_class = UserProfileUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def get_object(self):
        return self.request.user

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = UserSerializer(instance)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response({
            'message': 'Profile updated successfully',
            'user': UserSerializer(instance).data
        }, status=status.HTTP_200_OK)


class ChangePasswordView(APIView):
    """
    API endpoint for changing password
    POST /api/auth/change-password/
    Regenerates token after password change for security
    """
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        # Delete old token and create new one after password change for security
        try:
            request.user.auth_token.delete()
        except Exception:
            pass  # Token might not exist
        
        token = Token.objects.create(user=request.user)
        
        return Response({
            'message': 'Password changed successfully',
            'token': token.key
        }, status=status.HTTP_200_OK)


class DeleteAccountView(APIView):
    """
    API endpoint for account deletion
    DELETE /api/auth/delete-account/
    Permanently deletes user account and associated token
    """
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def delete(self, request):
        user = request.user
        username = user.username
        
        # Delete user's token first
        try:
            user.auth_token.delete()
        except Exception:
            pass  # Token might not exist
        
        # Delete the user (profile will be deleted automatically via CASCADE)
        user.delete()
        
        return Response({
            'message': f'Account {username} deleted successfully'
        }, status=status.HTTP_200_OK)


class UserDetailView(generics.RetrieveAPIView):
    """
    API endpoint to get current user details
    GET /api/auth/me/
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def get_object(self):
        return self.request.user