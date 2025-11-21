from django.urls import path
from ..views.report_views import admin_reports, user_reports

urlpatterns = [
    path('admin/', admin_reports, name='admin-reports'),
    path('user/', user_reports, name='user-reports'),
]
