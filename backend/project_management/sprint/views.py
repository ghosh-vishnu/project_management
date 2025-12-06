from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError, NotFound
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.db.models import Q
from django.utils import timezone
from .models import Sprint, SprintTask, SprintComment, SprintRetrospective
from .serializers import (
    SprintListSerializer,
    SprintDetailSerializer,
    SprintCreateSerializer,
    SprintTaskSerializer,
    SprintCommentSerializer,
    SprintRetrospectiveSerializer
)
from .ai_services import SprintAIService
from notifications.utils import notify_sprint_created


class SprintViewSet(viewsets.ModelViewSet):
    """ViewSet for Sprint CRUD operations"""
    permission_classes = [IsAuthenticated]
    queryset = Sprint.objects.select_related('project').prefetch_related(
        'tasks', 'retrospective'
    ).all()
    
    def get_serializer_class(self):
        if self.action == 'list':
            return SprintListSerializer
        elif self.action == 'retrieve':
            return SprintDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return SprintCreateSerializer
        return SprintListSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset().order_by('-created_at')
        
        # Filter by project
        project_id = self.request.query_params.get('project_id')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter.lower())
        
        # Search by name
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(name__icontains=search)
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        """List sprints with pagination"""
        try:
            queryset = self.get_queryset()
            
            # Pagination
            page = request.query_params.get('page', 1)
            page_size = request.query_params.get('page_size', 10)
            try:
                page = int(page)
                page_size = int(page_size)
            except (TypeError, ValueError):
                page = 1
                page_size = 10
            
            paginator = Paginator(queryset, page_size)
            try:
                page_obj = paginator.page(page)
            except (EmptyPage, PageNotAnInteger):
                page_obj = paginator.page(1)
            
            serializer = self.get_serializer(page_obj, many=True)
            return Response({
                'count': paginator.count,
                'next': page_obj.next_page_number() if page_obj.has_next() else None,
                'previous': page_obj.previous_page_number() if page_obj.has_previous() else None,
                'results': serializer.data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            import traceback
            error_detail = str(e)
            traceback.print_exc()
            return Response(
                {'error': f'Failed to list sprints: {error_detail}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def retrieve(self, request, *args, **kwargs):
        """Get sprint detail with tasks, comments, and retrospective"""
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Sprint.DoesNotExist:
            raise NotFound(detail='Sprint not found')
        except Exception as e:
            return Response(
                {'error': f'Failed to retrieve sprint: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def create(self, request, *args, **kwargs):
        """Create a new sprint"""
        try:
            serializer = self.get_serializer(data=request.data)
            if not serializer.is_valid():
                return Response(
                    {'error': 'Validation failed', 'details': serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST
                )
            sprint = serializer.save()
            
            # Calculate initial progress
            sprint.progress = sprint.calculate_progress()
            sprint.save()
            
            # Send notification to project team members
            try:
                # Notify the user who created the sprint
                if request.user:
                    notify_sprint_created(
                        user=request.user,
                        sprint_name=sprint.name,
                        sprint_id=sprint.id
                    )
            except Exception as notify_error:
                # Don't fail sprint creation if notification fails
                print(f"Notification error: {notify_error}")
            
            # Return sprint list serializer for consistency
            return Response(
                SprintListSerializer(sprint).data,
                status=status.HTTP_201_CREATED
            )
        except ValidationError as e:
            return Response(
                {'error': 'Validation failed', 'details': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            import traceback
            error_detail = str(e)
            traceback.print_exc()
            return Response(
                {'error': f'Failed to create sprint: {error_detail}'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def update(self, request, *args, **kwargs):
        """Update a sprint"""
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            sprint = serializer.save()
            
            # Recalculate progress
            sprint.progress = sprint.calculate_progress()
            sprint.save()
            
            return Response(
                SprintDetailSerializer(sprint).data,
                status=status.HTTP_200_OK
            )
        except Sprint.DoesNotExist:
            raise NotFound(detail='Sprint not found')
        except ValidationError:
            raise
        except Exception as e:
            return Response(
                {'error': f'Failed to update sprint: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def destroy(self, request, *args, **kwargs):
        """Delete a sprint"""
        try:
            instance = self.get_object()
            instance.delete()
            return Response(
                {'detail': 'Sprint deleted successfully'},
                status=status.HTTP_204_NO_CONTENT
            )
        except Sprint.DoesNotExist:
            raise NotFound(detail='Sprint not found')
        except Exception as e:
            return Response(
                {'error': f'Failed to delete sprint: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['get'])
    def burndown(self, request, pk=None):
        """Get burndown chart data"""
        try:
            sprint = self.get_object()
            
            # Get all tasks for the sprint
            tasks = sprint.tasks.all()
            total_tasks = tasks.count()
            
            # Generate data points for each day in the sprint
            start_date = sprint.start_date
            end_date = sprint.end_date
            today = timezone.now().date()
            
            burndown_data = []
            days_total = (end_date - start_date).days + 1
            ideal_decrement = total_tasks / days_total if days_total > 0 else 0
            
            current_date = start_date
            day_number = 0
            
            while current_date <= end_date:
                # Count tasks completed by this date
                completed_by_date = tasks.filter(
                    status='done',
                    updated_at__date__lte=current_date
                ).count()
                
                actual_remaining = total_tasks - completed_by_date
                
                # Calculate ideal remaining: should decrease linearly from total_tasks to 0
                # Formula: ideal = total_tasks - (ideal_decrement * day_number)
                ideal_remaining = max(0, total_tasks - (ideal_decrement * day_number))
                
                burndown_data.append({
                    'date': current_date.isoformat(),
                    'day': day_number,
                    'ideal_remaining': ideal_remaining,
                    'actual_remaining': actual_remaining,
                    'completed': completed_by_date
                })
                
                current_date += timezone.timedelta(days=1)
                day_number += 1
            
            return Response({
                'sprint_id': sprint.id,
                'sprint_name': sprint.name,
                'total_tasks': total_tasks,
                'data': burndown_data
            }, status=status.HTTP_200_OK)
        except Sprint.DoesNotExist:
            raise NotFound(detail='Sprint not found')
        except Exception as e:
            return Response(
                {'error': f'Failed to get burndown data: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class SprintTaskViewSet(viewsets.ModelViewSet):
    """ViewSet for SprintTask CRUD operations"""
    permission_classes = [IsAuthenticated]
    queryset = SprintTask.objects.select_related('sprint', 'assigned_to').all()
    serializer_class = SprintTaskSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by sprint
        sprint_id = self.request.query_params.get('sprint_id')
        if sprint_id:
            queryset = queryset.filter(sprint_id=sprint_id)
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter.lower())
        
        # Filter by assigned user
        assigned_to = self.request.query_params.get('assigned_to')
        if assigned_to:
            queryset = queryset.filter(assigned_to_id=assigned_to)
        
        return queryset
    
    def create(self, request, *args, **kwargs):
        """Create a new sprint task"""
        try:
            serializer = self.get_serializer(
                data=request.data,
                context={'request': request}
            )
            if not serializer.is_valid():
                return Response(
                    {'error': 'Validation failed', 'details': serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST
                )
            task = serializer.save()
            
            # Update sprint progress
            task.sprint.progress = task.sprint.calculate_progress()
            task.sprint.save()
            
            return Response(
                self.get_serializer(task).data,
                status=status.HTTP_201_CREATED
            )
        except ValidationError:
            raise
        except Exception as e:
            import traceback
            error_detail = str(e)
            traceback.print_exc()
            return Response(
                {'error': f'Failed to create task: {error_detail}'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def update(self, request, *args, **kwargs):
        """Update a sprint task"""
        try:
            instance = self.get_object()
            serializer = self.get_serializer(
                instance,
                data=request.data,
                partial=True,
                context={'request': request}
            )
            if not serializer.is_valid():
                return Response(
                    {'error': 'Validation failed', 'details': serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST
                )
            task = serializer.save()
            
            # Update sprint progress
            task.sprint.progress = task.sprint.calculate_progress()
            task.sprint.save()
            
            return Response(
                self.get_serializer(task).data,
                status=status.HTTP_200_OK
            )
        except SprintTask.DoesNotExist:
            raise NotFound(detail='Task not found')
        except ValidationError:
            raise
        except Exception as e:
            import traceback
            error_detail = str(e)
            traceback.print_exc()
            return Response(
                {'error': f'Failed to update task: {error_detail}'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def destroy(self, request, *args, **kwargs):
        """Delete a sprint task"""
        try:
            instance = self.get_object()
            sprint = instance.sprint
            instance.delete()
            
            # Update sprint progress
            sprint.progress = sprint.calculate_progress()
            sprint.save()
            
            return Response(
                {'detail': 'Task deleted successfully'},
                status=status.HTTP_204_NO_CONTENT
            )
        except SprintTask.DoesNotExist:
            raise NotFound(detail='Task not found')
        except Exception as e:
            return Response(
                {'error': f'Failed to delete task: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def sprint_comments(request, sprint_id):
    """Get or create sprint comments with search and filter support"""
    try:
        sprint = Sprint.objects.get(id=sprint_id)
    except Sprint.DoesNotExist:
        return Response(
            {'error': 'Sprint not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if request.method == 'GET':
        # Get all comments for the sprint
        comments = SprintComment.objects.filter(sprint=sprint).select_related('user').order_by('-created_at')
        
        # Search filter
        search = request.query_params.get('search', '')
        if search:
            comments = comments.filter(
                Q(content__icontains=search) |
                Q(user__username__icontains=search) |
                Q(user__first_name__icontains=search) |
                Q(user__last_name__icontains=search)
            )
        
        # Filter by user
        user_id = request.query_params.get('user_id')
        if user_id:
            comments = comments.filter(user_id=user_id)
        
        # Pagination
        page = request.query_params.get('page', 1)
        page_size = request.query_params.get('page_size', 20)
        try:
            page = int(page)
            page_size = int(page_size)
        except (TypeError, ValueError):
            page = 1
            page_size = 20
        
        paginator = Paginator(comments, page_size)
        try:
            page_obj = paginator.page(page)
        except (EmptyPage, PageNotAnInteger):
            page_obj = paginator.page(1)
        
        serializer = SprintCommentSerializer(page_obj, many=True, context={'request': request})
        return Response({
            'count': paginator.count,
            'next': page_obj.next_page_number() if page_obj.has_next() else None,
            'previous': page_obj.previous_page_number() if page_obj.has_previous() else None,
            'results': serializer.data
        }, status=status.HTTP_200_OK)
    
    elif request.method == 'POST':
        # Validate content
        content = request.data.get('content', '').strip()
        if not content:
            return Response(
                {'error': 'Comment content is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create comment directly
        try:
            comment = SprintComment.objects.create(
                sprint=sprint,
                user=request.user,
                content=content
            )
            serializer = SprintCommentSerializer(comment, context={'request': request})
            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            return Response(
                {'error': f'Failed to create comment: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def sprint_comment_detail(request, sprint_id, comment_id):
    """Get, update, or delete a specific sprint comment"""
    try:
        sprint = Sprint.objects.get(id=sprint_id)
    except Sprint.DoesNotExist:
        return Response(
            {'error': 'Sprint not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    try:
        comment = SprintComment.objects.get(id=comment_id, sprint=sprint)
    except SprintComment.DoesNotExist:
        return Response(
            {'error': 'Comment not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Check permissions - users can only edit/delete their own comments
    if request.method in ['PUT', 'DELETE']:
        if comment.user != request.user:
            return Response(
                {'error': 'You do not have permission to modify this comment'},
                status=status.HTTP_403_FORBIDDEN
            )
    
    if request.method == 'GET':
        serializer = SprintCommentSerializer(comment)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method == 'PUT':
        # Validate content
        content = request.data.get('content', '').strip()
        if not content:
            return Response(
                {'error': 'Comment content is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            comment.content = content
            comment.save()
            serializer = SprintCommentSerializer(comment, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'error': f'Failed to update comment: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    elif request.method == 'DELETE':
        try:
            comment.delete()
            return Response(
                {'detail': 'Comment deleted successfully'},
                status=status.HTTP_204_NO_CONTENT
            )
        except Exception as e:
            return Response(
                {'error': f'Failed to delete comment: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )




@api_view(['GET'])
@permission_classes([IsAuthenticated])
def users_list(request):
    """Get list of users for task assignment - only active employees"""
    from django.contrib.auth.models import User
    from employee.models import Employee
    from .serializers import UserMiniSerializer
    
    try:
        # Only return users who have an active Employee profile
        # This filters out test users, inactive employees, and other non-employee users
        active_employee_user_ids = Employee.objects.filter(
            is_active=True
        ).values_list('user_id', flat=True)
        
        users = User.objects.filter(
            id__in=active_employee_user_ids,
            is_active=True
        ).order_by('username')
        
        serializer = UserMiniSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {'error': f'Failed to fetch users: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET', 'POST', 'PUT'])
@permission_classes([IsAuthenticated])
def sprint_retrospective(request, sprint_id):
    """Get, create, or update sprint retrospective"""
    try:
        sprint = Sprint.objects.get(id=sprint_id)
    except Sprint.DoesNotExist:
        return Response(
            {'error': 'Sprint not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if request.method == 'GET':
        try:
            retrospective = SprintRetrospective.objects.get(sprint=sprint)
            serializer = SprintRetrospectiveSerializer(retrospective)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except SprintRetrospective.DoesNotExist:
            return Response(
                {'notes': ''},
                status=status.HTTP_200_OK
            )
    
    elif request.method == 'POST':
        # Create or update retrospective
        retrospective, created = SprintRetrospective.objects.get_or_create(
            sprint=sprint,
            defaults={'notes': request.data.get('notes', '')}
        )
        if not created:
            retrospective.notes = request.data.get('notes', '')
            retrospective.save()
        
        serializer = SprintRetrospectiveSerializer(retrospective)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method == 'PUT':
        try:
            retrospective = SprintRetrospective.objects.get(sprint=sprint)
            serializer = SprintRetrospectiveSerializer(
                retrospective,
                data=request.data,
                partial=True
            )
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except SprintRetrospective.DoesNotExist:
            serializer = SprintRetrospectiveSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(sprint=sprint)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ai_suggest_priority(request):
    """AI endpoint to suggest task priority based on title and description"""
    try:
        title = request.data.get('title', '')
        description = request.data.get('description', '')
        
        if not title:
            return Response(
                {'error': 'Title is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        suggested_priority = SprintAIService.suggest_priority(title, description)
        
        return Response({
            'suggested_priority': suggested_priority,
            'confidence': 'high' if title else 'medium'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {'error': f'Failed to suggest priority: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ai_generate_description(request):
    """AI endpoint to generate task description from title"""
    try:
        title = request.data.get('title', '')
        sprint_id = request.data.get('sprint_id')
        
        if not title:
            return Response(
                {'error': 'Title is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        sprint_context = None
        if sprint_id:
            try:
                sprint = Sprint.objects.get(id=sprint_id)
                sprint_context = {
                    'name': sprint.name,
                    'description': sprint.description
                }
            except Sprint.DoesNotExist:
                pass
        
        description = SprintAIService.generate_task_description(title, sprint_context)
        
        return Response({
            'description': description
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {'error': f'Failed to generate description: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ai_sprint_summary(request, sprint_id):
    """AI endpoint to generate sprint summary"""
    try:
        sprint = Sprint.objects.get(id=sprint_id)
        tasks = SprintTask.objects.filter(sprint=sprint)
        comments = SprintComment.objects.filter(sprint=sprint).order_by('-created_at')[:50]
        
        sprint_data = SprintDetailSerializer(sprint).data
        tasks_data = SprintTaskSerializer(tasks, many=True).data
        comments_data = SprintCommentSerializer(comments, many=True).data
        
        summary = SprintAIService.generate_sprint_summary(
            sprint_data,
            tasks_data,
            comments_data
        )
        
        return Response({
            'summary': summary
        }, status=status.HTTP_200_OK)
    except Sprint.DoesNotExist:
        return Response(
            {'error': 'Sprint not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'Failed to generate summary: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ai_retrospective_insights(request, sprint_id):
    """AI endpoint to generate retrospective insights"""
    try:
        sprint = Sprint.objects.get(id=sprint_id)
        tasks = SprintTask.objects.filter(sprint=sprint)
        
        try:
            retrospective = SprintRetrospective.objects.get(sprint=sprint)
            retrospective_data = SprintRetrospectiveSerializer(retrospective).data
        except SprintRetrospective.DoesNotExist:
            retrospective_data = {
                'notes': ''
            }
        
        sprint_data = SprintDetailSerializer(sprint).data
        tasks_data = SprintTaskSerializer(tasks, many=True).data
        
        insights = SprintAIService.generate_retrospective_insights(
            retrospective_data,
            tasks_data,
            sprint_data
        )
        
        return Response({
            'insights': insights
        }, status=status.HTTP_200_OK)
    except Sprint.DoesNotExist:
        return Response(
            {'error': 'Sprint not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'Failed to generate insights: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
