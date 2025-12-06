# project_management/urls.py
from django.urls import path, include
from django.contrib import admin as django_admin
from rest_framework.routers import DefaultRouter

try:
    from projects.views import ProjectViewSet
    router = DefaultRouter()
    router.register(r'projects', ProjectViewSet)
    api_urls = router.urls
except:
    api_urls = []

urlpatterns = [
    path('admin/', django_admin.site.urls),
    path('api/auth/', include('authentication.urls')),
    path('api/peoples/', include('employee.urls')),
    path('api/peoples/', include('teams.urls')),  # Teams endpoints
    path('api/peoples/', include('clients.urls')),  # Clients endpoints
    path('api/peoples/', include('leads.urls')),  # Leads endpoints
    path('api/', include('meeting_schedule.urls')),  # Meetings endpoints
    path('api/', include('proposal.urls')),  # Proposals endpoints
    path('api/', include('contracts.urls')),  # Contracts endpoints
    path('api/', include('tasks.urls')),  # Tasks endpoints
    path('api/', include('todo.urls')),  # ToDo endpoints
    path('api/', include('tickets.urls')),  # Tickets endpoints
    path('api/', include('projects.urls')),  # Projects names endpoint
    path('api/', include(api_urls)),
    path('api/project/', include('projects.urls_compat')),  # Friendly endpoints matching frontend
    path('api/finances/', include('setting.urls')),  # Bank accounts endpoints (under finances namespace)
    path('api/finances/', include('finance.urls')),  # Income endpoints (under finances namespace)
    path('api/', include('invoices.urls')),  # Invoices endpoints
    path('api/', include('sprint.urls')),  # Sprint endpoints
    path('api/', include('notifications.urls')),  # Notifications endpoints
]

# Serve media files in development
from django.conf import settings
from django.conf.urls.static import static

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
