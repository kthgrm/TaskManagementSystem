from rest_framework import serializers
from api.models import Comment, Notification, ActivityLog
from .user_serializers import UserSerializer


class CommentSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    replies = serializers.SerializerMethodField()
    replies_count = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'task', 'user', 'user_details', 'content', 'created_at', 
                  'updated_at', 'parent', 'is_edited', 'replies', 'replies_count']
        read_only_fields = ['user', 'created_at', 'updated_at', 'is_edited']

    def get_replies(self, obj):
        if obj.parent is None:  # Only get replies for top-level comments
            replies = obj.replies.all()
            return CommentSerializer(replies, many=True, context=self.context).data
        return []

    def get_replies_count(self, obj):
        if obj.parent is None:
            return obj.replies.count()
        return 0

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class NotificationSerializer(serializers.ModelSerializer):
    sender_details = UserSerializer(source='sender', read_only=True)
    task_title = serializers.CharField(source='task.title', read_only=True)

    class Meta:
        model = Notification
        fields = ['id', 'recipient', 'sender', 'sender_details', 'notification_type', 
                  'task', 'task_title', 'comment', 'message', 'is_read', 'created_at']
        read_only_fields = ['created_at']


class ActivityLogSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    task_title = serializers.CharField(source='task.title', read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True)

    class Meta:
        model = ActivityLog
        fields = ['id', 'user', 'user_details', 'action_type', 'task', 'task_title', 
                  'project', 'project_name', 'description', 'metadata', 'created_at']
        read_only_fields = ['created_at']
