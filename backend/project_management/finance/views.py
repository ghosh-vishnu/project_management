from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import NotFound, ValidationError
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from .models import Income, Expense
from .serializers import (
    IncomeListSerializer, IncomeCreateSerializer,
    ExpenseListSerializer, ExpenseCreateSerializer
)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def income_list(request):
    """List all incomes or create a new income"""
    
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
            
            # Get all incomes - remove duplicates using distinct()
            queryset = Income.objects.select_related(
                'client', 'project', 'bank_account'
            ).all().distinct()
            
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
            serializer = IncomeListSerializer(page_obj, many=True)
            data = serializer.data
            
            # Remove duplicates at serializer level
            seen = set()
            unique_data = []
            for item in data:
                # Create a unique key for each income
                item_key = (
                    item.get('id'),
                    item.get('amount'),
                    item.get('income_date')
                )
                if item_key not in seen:
                    seen.add(item_key)
                    # Format payment_mode for frontend display
                    payment_mode_val = item.get('payment_mode')
                    if payment_mode_val:
                        # Convert snake_case to Title Case
                        item['payment_mode'] = payment_mode_val.replace('_', ' ').title()
                    
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
                'error': f'Failed to fetch incomes: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    # POST - Create new income
    if request.method == 'POST':
        try:
            serializer = IncomeCreateSerializer(data=request.data)
            if serializer.is_valid():
                income = serializer.save()
                # Return list serializer for consistent response
                response_data = IncomeListSerializer(income).data
                # Format payment_mode
                if response_data.get('payment_mode'):
                    response_data['payment_mode'] = response_data['payment_mode'].replace('_', ' ').title()
                return Response(response_data, status=status.HTTP_201_CREATED)
            # Return detailed serializer errors
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({
                'error': f'Failed to create income: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def income_detail(request, pk):
    """Get, update, or delete a specific income"""
    
    try:
        income = Income.objects.select_related(
            'client', 'project', 'bank_account'
        ).get(pk=pk)
    except Income.DoesNotExist:
        return Response({
            'error': 'Income not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': f'Error locating income: {str(e)}'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if request.method == 'GET':
        try:
            data = IncomeListSerializer(income).data
            # Format payment_mode
            if data.get('payment_mode'):
                data['payment_mode'] = data['payment_mode'].replace('_', ' ').title()
            return Response(data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'error': f'Failed to serialize income: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    if request.method == 'PUT':
        try:
            serializer = IncomeCreateSerializer(income, data=request.data, partial=True)
            if serializer.is_valid():
                updated = serializer.save()
                response_data = IncomeListSerializer(updated).data
                # Format payment_mode
                if response_data.get('payment_mode'):
                    response_data['payment_mode'] = response_data['payment_mode'].replace('_', ' ').title()
                return Response(response_data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'error': f'Failed to update income: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    # DELETE
    if request.method == 'DELETE':
        try:
            income.delete()
            return Response({
                'detail': 'Income deleted successfully'
            }, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({
                'error': f'Failed to delete income: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def expense_list(request):
    """List all expenses or create a new expense"""
    
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
            
            # Get all expenses
            queryset = Expense.objects.select_related(
                'purchased_by', 'bank_account'
            ).all().distinct()
            
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
            serializer = ExpenseListSerializer(page_obj, many=True)
            data = serializer.data
            
            # Format payment_mode for frontend display
            for item in data:
                payment_mode_val = item.get('payment_mode')
                if payment_mode_val:
                    item['payment_mode'] = payment_mode_val.replace('_', ' ').title()
            
            return Response({
                'count': paginator.count,
                'next': page_obj.next_page_number() if page_obj.has_next() else None,
                'previous': page_obj.previous_page_number() if page_obj.has_previous() else None,
                'results': data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({
                'error': f'Failed to fetch expenses: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    # POST - Create new expense
    if request.method == 'POST':
        try:
            serializer = ExpenseCreateSerializer(data=request.data)
            if serializer.is_valid():
                expense = serializer.save()
                # Return list serializer for consistent response
                response_data = ExpenseListSerializer(expense).data
                # Format payment_mode
                if response_data.get('payment_mode'):
                    response_data['payment_mode'] = response_data['payment_mode'].replace('_', ' ').title()
                return Response(response_data, status=status.HTTP_201_CREATED)
            # Return detailed serializer errors
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({
                'error': f'Failed to create expense: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def expense_detail(request, pk):
    """Get, update, or delete a specific expense"""
    
    try:
        expense = Expense.objects.select_related(
            'purchased_by', 'bank_account'
        ).get(pk=pk)
    except Expense.DoesNotExist:
        return Response({
            'error': 'Expense not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': f'Error locating expense: {str(e)}'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if request.method == 'GET':
        try:
            data = ExpenseListSerializer(expense).data
            # Format payment_mode
            if data.get('payment_mode'):
                data['payment_mode'] = data['payment_mode'].replace('_', ' ').title()
            return Response(data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'error': f'Failed to serialize expense: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    if request.method == 'PUT':
        try:
            serializer = ExpenseCreateSerializer(expense, data=request.data, partial=True)
            if serializer.is_valid():
                updated = serializer.save()
                response_data = ExpenseListSerializer(updated).data
                # Format payment_mode
                if response_data.get('payment_mode'):
                    response_data['payment_mode'] = response_data['payment_mode'].replace('_', ' ').title()
                return Response(response_data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'error': f'Failed to update expense: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    # DELETE
    if request.method == 'DELETE':
        try:
            expense.delete()
            return Response({
                'detail': 'Expense deleted successfully'
            }, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({
                'error': f'Failed to delete expense: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)
