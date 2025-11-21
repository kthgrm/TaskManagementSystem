from django.urls import path, include

urlpatterns = [
    path('', include('api.urls.user_urls')),
    path('', include('api.urls.project_urls')),
    path('', include('api.urls.task_urls')),
    path('', include('api.urls.collaboration_urls')),
]
