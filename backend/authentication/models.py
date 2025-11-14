from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.authtoken.models import Token

class Profile(models.Model):
    """
    User Profile model extending Django's default User model
    """
    ROLE_CHOICES = [
        ('user', 'User'),
        ('admin', 'Admin'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
    bio = models.TextField(blank=True, null=True)
    profile_picture = models.ImageField(
        upload_to='profile_pictures/',
        blank=True,
        null=True
    )
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'profiles'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username}'s profile"
    
    @property
    def is_admin(self):
        """Check if user has admin role"""
        return self.role == 'admin'
    
    @property
    def is_user(self):
        """Check if user has user role"""
        return self.role == 'user'


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """
    Automatically create a profile when a user is created
    """
    if created:
        Profile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """
    Automatically save the profile when the user is saved
    """
    if hasattr(instance, 'profile'):
        instance.profile.save()


@receiver(post_save, sender=User)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    """
    Automatically create an authentication token for new users
    """
    if created:
        Token.objects.create(user=instance)