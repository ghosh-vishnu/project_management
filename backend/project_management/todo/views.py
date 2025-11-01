from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import NotFound, ValidationError
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from .models import ToDo
from .serializers import ToDoListSerializer, ToDoCreateSerializer


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def todo_list(request):
    """List all todos or create a new todo"""
    
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
            
            # Get all todos with related objects - remove duplicates using distinct()
            queryset = ToDo.objects.select_related('project').all().distinct()
            
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
            serializer = ToDoListSerializer(page_obj, many=True)
            data = serializer.data
            
            # Remove duplicates at serializer level
            seen = set()
            unique_data = []
            for item in data:
                # Create a unique key for each todo
                item_key = (
                    item.get('todo_name'),
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
                'error': f'Failed to fetch todos: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    # POST - Create new todo
    if request.method == 'POST':
        try:
            serializer = ToDoCreateSerializer(data=request.data)
            if serializer.is_valid():
                todo = serializer.save()
                # Return list serializer for consistent response
                response_data = ToDoListSerializer(todo).data
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
                'error': f'Failed to create todo: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def todo_detail(request, pk):
    """Get, update, or delete a specific todo"""
    
    try:
        todo = ToDo.objects.select_related('project').get(pk=pk)
    except ToDo.DoesNotExist:
        return Response({
            'error': 'ToDo not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': f'Error locating todo: {str(e)}'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if request.method == 'GET':
        try:
            data = ToDoListSerializer(todo).data
            # Format status and priority
            if data.get('status'):
                data['status'] = data['status'].replace('_', ' ').title()
            if data.get('priority'):
                data['priority'] = data['priority'].replace('_', ' ').title()
            return Response(data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'error': f'Failed to serialize todo: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    if request.method == 'PUT':
        try:
            serializer = ToDoCreateSerializer(todo, data=request.data, partial=True)
            if serializer.is_valid():
                updated = serializer.save()
                response_data = ToDoListSerializer(updated).data
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
                'error': f'Failed to update todo: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    # DELETE
    if request.method == 'DELETE':
        try:
            todo.delete()
            return Response({
                'detail': 'ToDo deleted successfully'
            }, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({
                'error': f'Failed to delete todo: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)

