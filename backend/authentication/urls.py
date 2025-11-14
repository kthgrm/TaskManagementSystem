from django.urls import path
from .views import (
    UserRegistrationView,
    UserLoginView,
    UserLogoutView,
    UserProfileView,
    ChangePasswordView,
    DeleteAccountView,
    UserDetailView,
)

urlpatterns = [
    # Authentication
    path('register/', UserRegistrationView.as_view(), name='user-register'),
    path('login/', UserLoginView.as_view(), name='user-login'),
    path('logout/', UserLogoutView.as_view(), name='user-logout'),
    
    # Profile Management
    path('me/', UserDetailView.as_view(), name='user-detail'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('delete-account/', DeleteAccountView.as_view(), name='delete-account'),
]