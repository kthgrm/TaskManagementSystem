from django.urls import path
from .views import (
    AdminUserListView,
    AdminUserDetailView,
    AdminUpdateUserRoleView,
    AdminStatsView
)

urlpatterns = [
    # Admin Only - User Management
    path('', AdminUserListView.as_view(), name='admin-user-list'),
    path('<int:pk>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('<int:pk>/role/', AdminUpdateUserRoleView.as_view(), name='admin-user-role'),
    path('stats/', AdminStatsView.as_view(), name='admin-stats'),
]
