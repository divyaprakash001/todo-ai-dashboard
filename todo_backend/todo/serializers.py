from rest_framework import serializers
from .models import Task, Category, ContextEntry
from django.utils import timezone

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id','name','usage_frequency')
    
    def validate(self, attrs):
        name = attrs['name']
        print(name)
        if Category.objects.filter(name=name).exists():
            raise serializers.ValidationError({
                "name": "Category with this name already exists. Try another."
            })
        return attrs

class ContextEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = ContextEntry
        fields = ('id','content','source_type','processed_insights','created_at')

    def validate_content(self, value):
        if len(value.strip()) < 3:
            raise serializers.ValidationError("Context content is too short.")
        return value

class TaskSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    class Meta:
        model = Task
        fields = ('id','title','description','category','category_name','priority_score','deadline','status','created_at','updated_at')
        read_only_fields = ('priority_score','created_at','updated_at')

    def validate_title(self, value):
        if len(value.strip()) < 3:
            raise serializers.ValidationError("Title must be at least 3 characters.")
        return value

    def validate_deadline(self, value):
        if value and value < timezone.localdate():
            raise serializers.ValidationError("Deadline cannot be in the past.")
        return value

    def create(self, validated_data):
        return Task.objects.create(**validated_data)

    def update(self, instance, validated_data):
        validated_data.pop('priority_score', None)
        return super().update(instance, validated_data)
