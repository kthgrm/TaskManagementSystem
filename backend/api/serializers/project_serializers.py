from rest_framework import serializers
from api.models import Project, User


class ProjectSerializer(serializers.ModelSerializer):
    """Serializer for Project model"""
    created_by = serializers.PrimaryKeyRelatedField(
        read_only=True,
        default=serializers.CurrentUserDefault()
    )
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    created_by_details = serializers.SerializerMethodField()
    members_details = serializers.SerializerMethodField()
    task_count = serializers.SerializerMethodField()
    completion_percentage = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = ['id', 'title', 'description', 'start_date', 'end_date',
                  'created_by', 'created_by_username', 'created_by_details', 'members', 'members_details',
                  'task_count', 'completion_percentage', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

    def get_created_by_details(self, obj):
        if obj.created_by:
            return {
                'id': obj.created_by.id,
                'username': obj.created_by.username,
                'email': obj.created_by.email,
                'first_name': obj.created_by.first_name,
                'last_name': obj.created_by.last_name,
                'profile_picture': obj.created_by.profile_picture.url if obj.created_by.profile_picture else None
            }
        return None

    def get_members_details(self, obj):
        return [{
            'id': member.id, 
            'username': member.username, 
            'email': member.email,
            'first_name': member.first_name,
            'last_name': member.last_name,
            'profile_picture': member.profile_picture.url if member.profile_picture else None
        } for member in obj.members.all()]

    def get_task_count(self, obj):
        return obj.tasks.count()

    def get_completion_percentage(self, obj):
        """Calculate completion percentage based on completed tasks"""
        total_tasks = obj.tasks.count()
        if total_tasks == 0:
            return 0
        completed_tasks = obj.tasks.filter(status='completed').count()
        return round((completed_tasks / total_tasks) * 100)


class ProjectCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating projects"""
    created_by = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        required=False,
        allow_null=True
    )
    
    class Meta:
        model = Project
        fields = ['title', 'description', 'start_date', 'end_date', 'created_by', 'members']

    def create(self, validated_data):
        members = validated_data.pop('members', [])
        # If created_by not provided, it will be set in the view
        project = Project.objects.create(**validated_data)
        project.members.set(members)
        return project

    def update(self, instance, validated_data):
        members = validated_data.pop('members', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if members is not None:
            instance.members.set(members)
        instance.save()
        return instance
