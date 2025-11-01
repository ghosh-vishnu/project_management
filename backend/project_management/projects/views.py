from django.shortcuts import render

# Create your views here.
# projects/views.py
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError, NotFound
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from .serializers import ProjectListSerializer, ProjectCreateSerializer
from .models import Project
from .models import Project
from .serializers import ProjectSerializer

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.select_related('assigned_to', 'client').all()

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return ProjectListSerializer
        return ProjectCreateSerializer

    def list(self, request, *args, **kwargs):
        try:
            response = super().list(request, *args, **kwargs)
            # Pretty-print status labels
            if isinstance(response.data, list):
                for item in response.data:
                    s = item.get('status')
                    if s:
                        item['status'] = s.replace('_', ' ').title()
            return response
        except Exception as e:
            return Response({'error': f'Failed to list projects: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def retrieve(self, request, *args, **kwargs):
        try:
            response = super().retrieve(request, *args, **kwargs)
            if isinstance(response.data, dict) and response.data.get('status'):
                response.data['status'] = response.data['status'].replace('_', ' ').title()
            return response
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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def project_names_list(request):
    """Get list of project names for dropdowns"""
    try:
        projects = Project.objects.all()
        data = []
        for project in projects:
            data.append({
                'id': project.id,
                'title': project.title or ''
            })
        return Response(data)
    except Exception as e:
        return Response({'error': f'Failed to fetch project names: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def project_list(request):
    if request.method == 'GET':
        try:
            raw_page = request.query_params.get('page', '1')
            raw_page_size = request.query_params.get('page_size', '25')
            try:
                page = int(str(raw_page).strip() or '1')
            except (TypeError, ValueError):
                page = 1
            if page < 1:
                page = 1
            try:
                page_size = int(str(raw_page_size).strip() or '25')
            except (TypeError, ValueError):
                page_size = 25
            if page_size < 1:
                page_size = 1
            if page_size > 200:
                page_size = 200

            queryset = Project.objects.select_related('assigned_to', 'client').all()
            paginator = Paginator(queryset, page_size)
            try:
                page_obj = paginator.page(page)
            except (EmptyPage, PageNotAnInteger):
                if page > paginator.num_pages:
                    page_obj = paginator.page(paginator.num_pages or 1)
                else:
                    page_obj = paginator.page(1)

            serializer = ProjectListSerializer(page_obj, many=True)
            # Map status for frontend: convert internal choices to display labels
            data = serializer.data
            for item in data:
                status_val = item.get('status')
                if status_val:
                    item['status'] = status_val.replace('_', ' ').title()
            return Response({
                'count': paginator.count,
                'next': page_obj.next_page_number() if page_obj.has_next() else None,
                'previous': page_obj.previous_page_number() if page_obj.has_previous() else None,
                'results': data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': f'Failed to fetch projects: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    try:
        serializer = ProjectCreateSerializer(data=request.data)
        if serializer.is_valid():
            project = serializer.save()
            return Response(ProjectListSerializer(project).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': f'Failed to create project: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def project_detail(request, pk: int):
    try:
        project = Project.objects.select_related('assigned_to', 'client').get(pk=pk)
    except Project.DoesNotExist:
        return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': f'Error locating project: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'GET':
        try:
            data = ProjectListSerializer(project).data
            if data.get('status'):
                data['status'] = data['status'].replace('_', ' ').title()
            return Response(data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': f'Failed to serialize project: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    if request.method == 'PUT':
        try:
            serializer = ProjectCreateSerializer(project, data=request.data, partial=True)
            if serializer.is_valid():
                updated = serializer.save()
                return Response(ProjectListSerializer(updated).data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': f'Failed to update project: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        project.delete()
        return Response({'detail': 'Project deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
    except Exception as e:
        return Response({'error': f'Failed to delete project: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
