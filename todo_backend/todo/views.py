from django.shortcuts import render

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from .models import Task, Category, ContextEntry
from .serializers import TaskSerializer, CategorySerializer, ContextEntrySerializer
from django.shortcuts import get_object_or_404
from .ai_utils import get_ai_task_suggestions_single, get_ai_task_suggestions_bulk
from django.db import transaction
from datetime import datetime


# checking the task to be added for current user only
class IsOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user

class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.is_valid(raise_exception=True)
        serializer.save(user=self.request.user)

class ContextEntryViewSet(viewsets.ModelViewSet):
    serializer_class = ContextEntrySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ContextEntry.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        return Task.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    

    @action(detail=True, methods=['POST'], url_path='ai-enhance')
    def ai_enhance(self, request, pk=None):
        # getting the task
        task = get_object_or_404(Task, pk=pk, user=request.user)

        # fetching only 30 enteries
        recent_contexts = list(
            ContextEntry.objects.filter(user=request.user)
            .order_by('-created_at')[:30]
            .values('content', 'source_type', 'created_at')
        )

        # 3. trim the content to avoid long ai prompys
        for ctx in recent_contexts:
            ctx['content'] = ctx['content'][:500]

        # calling the ai function from ai_utils.py
        ai_result = get_ai_task_suggestions_single(task, recent_contexts, request.user)

        # applying ai suggestions safely
        updated = False
        if isinstance(ai_result, dict):
            score = ai_result.get('priority_score')
            if isinstance(score, int) and 0 <= score <= 10:
                task.priority_score = score
                updated = True

            # for deadline
            deadline_str = ai_result.get('deadline')
            if deadline_str:
                try:
                    d = datetime.strptime(deadline_str, '%Y-%m-%d').date()
                    if d >= datetime.today().date():
                        task.deadline = d
                        updated = True
                except Exception:
                    pass

            # this is improved description
            if ai_result.get('improved_description'):
                task.description = ai_result['improved_description']
                updated = True

            # category suggested
            if ai_result.get('suggested_category'):
                cat_name = ai_result['suggested_category']
                cat_obj, _ = Category.objects.get_or_create(user=request.user, name=cat_name)
                task.category = cat_obj
                updated = True

            # if any update happens, save it
            if updated:
                task.save()

        # return the result to the client
        return Response({
            'ai': ai_result,
            'task': TaskSerializer(task).data
        })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def ai_bulk_suggestions(request):
    user = request.user
    tasks = Task.objects.filter(user=user)
    contexts = ContextEntry.objects.filter(user=user).order_by('-created_at')[:50]
    task_data = TaskSerializer(tasks, many=True).data
    context_data = ContextEntrySerializer(contexts, many=True).data

    ai_results = get_ai_task_suggestions_bulk(task_data, context_data, user)
    updated = []
    with transaction.atomic():
        for res in ai_results:
            task_obj = None
            if res.get('id'):
                try:
                    task_obj = Task.objects.get(pk=res['id'], user=user)
                except Task.DoesNotExist:
                    task_obj = None
            if not task_obj and res.get('title'):
                task_obj = Task.objects.filter(user=user, title=res['title']).first()
            if not task_obj:
                continue

            # safe updates
            if isinstance(res.get('priority_score'), int) and 0 <= res['priority_score'] <= 10:
                task_obj.priority_score = res['priority_score']
            if res.get('deadline'):
                try:
                    d = datetime.strptime(res['deadline'], '%Y-%m-%d').date()
                    if d >= datetime.today().date():
                        task_obj.deadline = d
                except:
                    pass
            if res.get('improved_description'):
                task_obj.description = res['improved_description']
            if res.get('suggested_category'):
                cat_obj, _ = Category.objects.get_or_create(user=user, name=res['suggested_category'])
                task_obj.category = cat_obj
            task_obj.save()
            updated.append(TaskSerializer(task_obj).data)
    return Response({'updated_tasks': updated})
