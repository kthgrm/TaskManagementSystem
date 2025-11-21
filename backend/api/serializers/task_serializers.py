from rest_framework import serializers
from api.models import Task, Project, User


class TaskSerializer(serializers.ModelSerializer):
    """Serializer for Task model"""
    created_by = serializers.PrimaryKeyRelatedField(
        read_only=True,
        default=serializers.CurrentUserDefault()
    )
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    assigned_to_username = serializers.CharField(source='assigned_to.username', read_only=True, allow_null=True)
    assigned_to_details = serializers.SerializerMethodField()
    project_name = serializers.CharField(source='project.title', read_only=True)

    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'project', 'project_name',
                  'assigned_to', 'assigned_to_username', 'assigned_to_details', 
                  'created_by', 'created_by_username',
                  'priority', 'status', 'due_date', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

    def get_assigned_to_details(self, obj):
        if obj.assigned_to:
            return {
                'id': obj.assigned_to.id,
                'username': obj.assigned_to.username,
                'email': obj.assigned_to.email,
                'first_name': obj.assigned_to.first_name,
                'last_name': obj.assigned_to.last_name,
                'profile_picture': obj.assigned_to.profile_picture.url if obj.assigned_to.profile_picture else None
            }
        return None


class TaskCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating tasks"""
    
    class Meta:
        model = Task
        fields = ['title', 'description', 'project', 'assigned_to', 
                  'priority', 'status', 'due_date']

    def validate_project(self, value):
        """Ensure the user has access to the project"""
        request = self.context.get('request')
        if request and request.user:
            # Check if user is project creator or member
            if request.user != value.created_by and request.user not in value.members.all():
                if request.user.role != 'admin':
                    raise serializers.ValidationError("You don't have access to this project")
        return value
