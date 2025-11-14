from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import Profile


class ProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for Profile model
    """
    class Meta:
        model = Profile
        fields = ['role', 'bio', 'profile_picture', 'phone_number', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for User model with profile data
    """
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'profile', 'date_joined']
        read_only_fields = ['id', 'date_joined']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration
    """
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'first_name', 'last_name']
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': False},
            'last_name': {'required': False},
        }

    def validate_username(self, value):
        """Validate username uniqueness"""
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    def validate_email(self, value):
        """Validate email uniqueness"""
        if User.objects.filter(email=value.lower()).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value.lower()

    def validate(self, attrs):
        """Validate that passwords match"""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})  
        return attrs

    def create(self, validated_data):
        """Create new user"""
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user


class UserLoginSerializer(serializers.Serializer):
    """
    Serializer for user login - supports both username and email
    """
    username_or_email = serializers.CharField(required=True)
    password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )

    def validate(self, attrs):
        """Authenticate user with username or email"""
        username_or_email = attrs.get('username_or_email')
        password = attrs.get('password')

        # Try to find user by username or email
        user = None
        if '@' in username_or_email:
            # Attempt login with email
            try:
                user_obj = User.objects.get(email=username_or_email.lower())
                user = authenticate(username=user_obj.username, password=password)
            except User.DoesNotExist:
                pass
        else:
            # Attempt login with username
            user = authenticate(username=username_or_email, password=password)

        if not user:
            raise serializers.ValidationError("Invalid credentials.")

        if not user.is_active:
            raise serializers.ValidationError("User account is disabled.")

        attrs['user'] = user
        return attrs


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating user profile
    """
    role = serializers.CharField(required=False, source='profile.role', read_only=True)
    bio = serializers.CharField(required=False, allow_blank=True, source='profile.bio')
    profile_picture = serializers.ImageField(required=False, allow_null=True, source='profile.profile_picture')
    phone_number = serializers.CharField(required=False, allow_blank=True, source='profile.phone_number')

    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name', 'role', 'bio', 'profile_picture', 'phone_number']

    def validate_email(self, value):
        """Validate email uniqueness"""
        user = self.context['request'].user
        if User.objects.filter(email=value.lower()).exclude(pk=user.pk).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value.lower()

    def update(self, instance, validated_data):
        """Update user and profile"""
        profile_data = validated_data.pop('profile', {})
        
        # Update User fields
        instance.email = validated_data.get('email', instance.email)
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.save()
        
        # Update Profile fields
        profile = instance.profile
        for attr, value in profile_data.items():
            setattr(profile, attr, value)
        profile.save()
        
        return instance


class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer for password change
    """
    old_password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    new_password_confirm = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )

    def validate_old_password(self, value):
        """Validate old password is correct"""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value

    def validate(self, attrs):
        """Validate that new passwords match"""
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({"new_password_confirm": "New passwords do not match."})
        return attrs

    def save(self, **kwargs):
        """Update user password"""
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user