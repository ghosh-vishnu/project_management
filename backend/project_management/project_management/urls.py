"""
URL configuration for project_management project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
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
    path('api/', include(api_urls)),
]

# Serve media files in development
from django.conf import settings
from django.conf.urls.static import static

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
