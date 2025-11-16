from rest_framework import serializers
from api.models import Project, User


class ProjectSerializer(serializers.ModelSerializer):
    """Serializer for Project model"""
    created_by = serializers.PrimaryKeyRelatedField(
        read_only=True,
        default=serializers.CurrentUserDefault()
    )
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    members_details = serializers.SerializerMethodField()
    task_count = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = ['id', 'title', 'description', 'status', 'start_date', 'end_date',
                  'created_by', 'created_by_username', 'members', 'members_details',
                  'task_count', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

    def get_members_details(self, obj):
        return [{'id': member.id, 'username': member.username, 'email': member.email} 
                for member in obj.members.all()]

    def get_task_count(self, obj):
        return obj.tasks.count()


class ProjectCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating projects"""
    
    class Meta:
        model = Project
        fields = ['title', 'description', 'status', 'start_date', 'end_date', 'members']

    def create(self, validated_data):
        members = validated_data.pop('members', [])
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
