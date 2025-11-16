from django.db import models
from django.contrib.auth.models import AbstractUser

def profile_upload_path(instance, filename):
    return f"profile_pictures/user_{instance.id}/{filename}"

class User(AbstractUser):
    # Override default ID (optional, Django already auto-creates it)
    id = models.AutoField(primary_key=True)

    # Inherited fields:
    # username
    # first_name
    # last_name
    # email
    # password

    phone = models.CharField(max_length=20, blank=True, null=True)

    role = models.CharField(
        max_length=20,
        choices=[
            ('admin', 'Admin'),
            ('user', 'User'),
        ],
        default='user'
    )

    profile_picture = models.ImageField(
        upload_to='profile_pictures/',
        blank=True,
        null=True
    )

    REQUIRED_FIELDS = ['email']

    def __str__(self):
        return f"{self.username} ({self.role})"