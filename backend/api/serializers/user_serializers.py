from rest_framework import serializers
from api.models import User
from django.contrib.auth import authenticate


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                  'phone', 'role', 'profile_picture', 'date_joined']
        read_only_fields = ['id', 'date_joined']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 
                  'first_name', 'last_name', 'phone']

    def validate_username(self, value):
        """Check if username already exists"""
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    def validate_email(self, value):
        """Check if email already exists"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({"password2": "Passwords do not match"})
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user


class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login - accepts username or email"""
    username_or_email = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True, required=True)

    def validate(self, data):
        username_or_email = data.get('username_or_email')
        password = data.get('password')

        if not username_or_email or not password:
            raise serializers.ValidationError("Must include username/email and password")

        # Try to find user by username or email
        user = None
        
        # Check if it's an email
        if '@' in username_or_email:
            try:
                user_obj = User.objects.get(email=username_or_email)
                user = authenticate(username=user_obj.username, password=password)
            except User.DoesNotExist:
                pass
        else:
            # Try as username
            user = authenticate(username=username_or_email, password=password)
        
        if user:
            if not user.is_active:
                raise serializers.ValidationError("User account is disabled")
            data['user'] = user
        else:
            raise serializers.ValidationError("Invalid credentials. Please check your username/email and password.")
        
        return data


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile with more details"""
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                  'phone', 'role', 'profile_picture', 'date_joined', 'last_login']
        read_only_fields = ['id', 'username', 'date_joined', 'last_login', 'role']
