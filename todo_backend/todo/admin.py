from django.contrib import admin
from .models import Task, Category, ContextEntry

# registering my models to see my models table in admin panel
admin.site.register(Task)
admin.site.register(Category)
admin.site.register(ContextEntry)
