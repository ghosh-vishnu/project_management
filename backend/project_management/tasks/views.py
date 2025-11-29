from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import NotFound, ValidationError
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from .models import Task
from .serializers import TaskListSerializer, TaskCreateSerializer
from notifications.utils import notify_task_assigned


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def task_list(request):
    """List all tasks or create a new task"""
    
    if request.method == 'GET':
        try:
            # Get pagination parameters
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
            
            # Get all tasks with related objects - remove duplicates using distinct()
            queryset = Task.objects.select_related('project', 'assigned_to').all().distinct()
            
            # Paginate
            paginator = Paginator(queryset, page_size)
            try:
                page_obj = paginator.page(page)
            except (EmptyPage, PageNotAnInteger):
                if page > paginator.num_pages:
                    page_obj = paginator.page(paginator.num_pages or 1)
                else:
                    page_obj = paginator.page(1)
            
            # Serialize data
            serializer = TaskListSerializer(page_obj, many=True)
            data = serializer.data
            
            # Remove duplicates at serializer level
            seen = set()
            unique_data = []
            for item in data:
                # Create a unique key for each task
                item_key = (
                    item.get('task_name'),
                    item.get('id')
                )
                if item_key not in seen:
                    seen.add(item_key)
                    # Format status and priority for frontend display
                    status_val = item.get('status')
                    if status_val:
                        item['status'] = status_val.replace('_', ' ').title()
                    
                    priority_val = item.get('priority')
                    if priority_val:
                        item['priority'] = priority_val.replace('_', ' ').title()
                    
                    unique_data.append(item)
            
            return Response({
                'count': len(unique_data),
                'next': page_obj.next_page_number() if page_obj.has_next() else None,
                'previous': page_obj.previous_page_number() if page_obj.has_previous() else None,
                'results': unique_data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({
                'error': f'Failed to fetch tasks: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    # POST - Create new task
    if request.method == 'POST':
        try:
            serializer = TaskCreateSerializer(data=request.data)
            if serializer.is_valid():
                task = serializer.save()
                
                # Send notification if task is assigned to someone
                if task.assigned_to and task.assigned_to.user:
                    try:
                        notify_task_assigned(
                            user=task.assigned_to.user,
                            task_name=task.task_name,
                            task_id=task.id,
                            assigned_by=request.user.username
                        )
                    except Exception as notify_error:
                        # Don't fail task creation if notification fails
                        print(f"Notification error: {notify_error}")
                
                # Return list serializer for consistent response
                response_data = TaskListSerializer(task).data
                # Format status and priority
                if response_data.get('status'):
                    response_data['status'] = response_data['status'].replace('_', ' ').title()
                if response_data.get('priority'):
                    response_data['priority'] = response_data['priority'].replace('_', ' ').title()
                return Response(response_data, status=status.HTTP_201_CREATED)
            # Return detailed serializer errors
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({
                'error': f'Failed to create task: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def task_detail(request, pk):
    """Get, update, or delete a specific task"""
    
    try:
        task = Task.objects.select_related('project', 'assigned_to').get(pk=pk)
    except Task.DoesNotExist:
        return Response({
            'error': 'Task not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': f'Error locating task: {str(e)}'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if request.method == 'GET':
        try:
            data = TaskListSerializer(task).data
            # Format status and priority
            if data.get('status'):
                data['status'] = data['status'].replace('_', ' ').title()
            if data.get('priority'):
                data['priority'] = data['priority'].replace('_', ' ').title()
            return Response(data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'error': f'Failed to serialize task: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    if request.method == 'PUT':
        try:
            serializer = TaskCreateSerializer(task, data=request.data, partial=True)
            if serializer.is_valid():
                updated = serializer.save()
                response_data = TaskListSerializer(updated).data
                # Format status and priority
                if response_data.get('status'):
                    response_data['status'] = response_data['status'].replace('_', ' ').title()
                if response_data.get('priority'):
                    response_data['priority'] = response_data['priority'].replace('_', ' ').title()
                return Response(response_data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'error': f'Failed to update task: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    # DELETE
    if request.method == 'DELETE':
        try:
            task.delete()
            return Response({
                'detail': 'Task deleted successfully'
            }, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({
                'error': f'Failed to delete task: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def remove_duplicate_tasks(request):
    """Remove duplicate tasks, keeping only the first created one"""
    try:
        # Get all tasks ordered by creation date
        all_tasks = Task.objects.select_related('project', 'assigned_to').order_by('created_at')
        
        # Track unique task signatures and IDs to delete
        seen_signatures = {}
        duplicate_ids = []
        
        for task in all_tasks:
            # Create a signature based on task details
            signature = (
                task.task_name.lower().strip() if task.task_name else None,
                task.project_id,
                task.assigned_to_id,
                task.priority,
                task.status,
                str(task.start_date) if task.start_date else None,
                str(task.end_date) if task.end_date else None,
                (task.description or '').strip()[:100]  # First 100 chars of description
            )
            
            if signature in seen_signatures:
                # This is a duplicate - mark for deletion
                duplicate_ids.append(task.id)
            else:
                # First time seeing this signature - keep it
                seen_signatures[signature] = task.id
        
        # Delete duplicates
        deleted_count = 0
        if duplicate_ids:
            deleted_count = Task.objects.filter(id__in=duplicate_ids).count()
            Task.objects.filter(id__in=duplicate_ids).delete()
        
        return Response({
            'message': f'Successfully removed {deleted_count} duplicate task(s).',
            'deleted_count': deleted_count,
            'remaining_count': Task.objects.count()
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({
            'error': f'Failed to remove duplicates: {str(e)}'
        }, status=status.HTTP_400_BAD_REQUEST)