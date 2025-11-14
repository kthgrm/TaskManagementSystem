from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from authentication.models import Profile

class ProfileInline(admin.StackedInline):
    """
    Inline admin for Profile
    """
    model = Profile
    can_delete = False
    verbose_name_plural = 'Profile'
    fields = ['bio', 'profile_picture', 'phone_number']


class UserAdmin(BaseUserAdmin):
    """
    Extended User admin with Profile inline
    """
    inlines = [ProfileInline]
    list_display = ['username', 'email', 'first_name', 'last_name', 'is_staff', 'is_active', 'date_joined']
    list_filter = ['is_staff', 'is_active', 'date_joined']
    search_fields = ['username', 'email', 'first_name', 'last_name']


# Unregister the default User admin
admin.site.unregister(User)
# Register the new User admin with Profile inline
admin.site.register(User, UserAdmin)


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    """
    Admin for Profile model
    """
    list_display = ['user', 'phone_number', 'role','created_at', 'updated_at']
    list_filter = ['created_at', 'updated_at']
    search_fields = ['user__username', 'user__email', 'phone_number']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('User', {'fields': ('user',)}),
        ('Profile Information', {'fields': ('bio', 'profile_picture', 'phone_number', 'role')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )
