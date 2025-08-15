from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from todo import views as todo_views
from users.views import RegisterView, ProfileView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

# router for using viewset
router = DefaultRouter()
router.register('categories', todo_views.CategoryViewSet, basename='category')
router.register('contexts', todo_views.ContextEntryViewSet, basename='context')
router.register('tasks', todo_views.TaskViewSet, basename='task')

# urls

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/ai/bulk/', todo_views.ai_bulk_suggestions, name='ai-bulk'),
    path('api/auth/register/', RegisterView.as_view(), name='register'),
    path('api/auth/profile/', ProfileView.as_view(), name='profile'),

    # for generating tokens used for login and register authentication
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
