from django.db import models

# Create your models here.
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone

User = settings.AUTH_USER_MODEL

class Category(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='categories')
    name = models.CharField(max_length=100)
    usage_frequency = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ('user', 'name')
        ordering = ['name']

    def __str__(self):
        return f"{self.name}"

class ContextEntry(models.Model):
    SOURCE_CHOICES = [
        ('whatsapp', 'WhatsApp'),
        ('email', 'Email'),
        ('note', 'Note'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='contexts')
    content = models.TextField()
    source_type = models.CharField(max_length=20, choices=SOURCE_CHOICES)
    processed_insights = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.source_type} - {self.created_at.date()}"

class Task(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='tasks')
    priority_score = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(10)], default=0)
    deadline = models.DateField(blank=True, null=True)
    STATUS_CHOICES = [('pending','Pending'),('in_progress','In Progress'),('completed','Completed')]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-priority_score','deadline','-created_at']

    def clean(self):
        if self.deadline and self.deadline < timezone.localdate():
            from django.core.exceptions import ValidationError
            raise ValidationError("Deadline cannot be in the past.")

    def __str__(self):
        return self.title
