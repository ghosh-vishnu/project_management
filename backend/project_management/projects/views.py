from django.shortcuts import render

# Create your views here.
# projects/views.py
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError, NotFound
from .models import Project
from .serializers import ProjectSerializer

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

    def list(self, request, *args, **kwargs):
        try:
            return super().list(request, *args, **kwargs)
        except Exception as e:
            return Response({'error': f'Failed to list projects: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def retrieve(self, request, *args, **kwargs):
        try:
            return super().retrieve(request, *args, **kwargs)
        except Project.DoesNotExist:
            raise NotFound(detail='Project not found')
        except Exception as e:
            return Response({'error': f'Failed to retrieve project: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except ValidationError:
            raise
        except Exception as e:
            raise ValidationError({'error': f'Failed to create project: {str(e)}'})

    def update(self, request, *args, **kwargs):
        try:
            return super().update(request, *args, **kwargs)
        except ValidationError:
            raise
        except Project.DoesNotExist:
            raise NotFound(detail='Project not found')
        except Exception as e:
            raise ValidationError({'error': f'Failed to update project: {str(e)}'})

    def destroy(self, request, *args, **kwargs):
        try:
            return super().destroy(request, *args, **kwargs)
        except Project.DoesNotExist:
            raise NotFound(detail='Project not found')
        except Exception as e:
            return Response({'error': f'Failed to delete project: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
