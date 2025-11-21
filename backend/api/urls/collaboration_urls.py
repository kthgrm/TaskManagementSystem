from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api.views import CommentViewSet, NotificationViewSet, ActivityLogViewSet

router = DefaultRouter()
router.register(r'comments', CommentViewSet, basename='comment')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'activities', ActivityLogViewSet, basename='activity')

urlpatterns = [
    path('', include(router.urls)),
]
