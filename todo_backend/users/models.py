from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    pass

class Profile(models.Model):
    user = models.OneToOneField('users.CustomUser', on_delete=models.CASCADE, related_name='profile')
    timezone = models.CharField(max_length=50, blank=True, default='Asia/Kolkata')
    ai_preference = models.JSONField(blank=True, null=True)

    def __str__(self):
        return f"Profile({self.user.username})"
