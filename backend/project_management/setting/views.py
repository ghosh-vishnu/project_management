from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import NotFound, ValidationError
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from .models import BankAccount
from .serializers import BankAccountListSerializer, BankAccountCreateSerializer


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def bank_account_list(request):
    """List all bank accounts or create a new bank account"""
    
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
            
            # Get all bank accounts - remove duplicates using distinct()
            queryset = BankAccount.objects.all().distinct()
            
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
            serializer = BankAccountListSerializer(page_obj, many=True)
            data = serializer.data
            
            # Remove duplicates at serializer level
            seen = set()
            unique_data = []
            for item in data:
                # Create a unique key for each bank account
                item_key = (
                    item.get('account_number'),
                    item.get('id')
                )
                if item_key not in seen:
                    seen.add(item_key)
                    # Format status and account_type for frontend display
                    status_val = item.get('status')
                    if status_val:
                        item['status'] = status_val.title()
                    
                    account_type_val = item.get('account_type')
                    if account_type_val:
                        item['account_type'] = account_type_val.title()
                    
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
                'error': f'Failed to fetch bank accounts: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    # POST - Create new bank account
    if request.method == 'POST':
        try:
            serializer = BankAccountCreateSerializer(data=request.data)
            if serializer.is_valid():
                bank_account = serializer.save()
                # Return list serializer for consistent response
                response_data = BankAccountListSerializer(bank_account).data
                # Format status and account_type
                if response_data.get('status'):
                    response_data['status'] = response_data['status'].title()
                if response_data.get('account_type'):
                    response_data['account_type'] = response_data['account_type'].title()
                return Response(response_data, status=status.HTTP_201_CREATED)
            # Return detailed serializer errors
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({
                'error': f'Failed to create bank account: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def bank_account_detail(request, pk):
    """Get, update, or delete a specific bank account"""
    
    try:
        bank_account = BankAccount.objects.get(pk=pk)
    except BankAccount.DoesNotExist:
        return Response({
            'error': 'Bank account not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': f'Error locating bank account: {str(e)}'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if request.method == 'GET':
        try:
            data = BankAccountListSerializer(bank_account).data
            # Format status and account_type
            if data.get('status'):
                data['status'] = data['status'].title()
            if data.get('account_type'):
                data['account_type'] = data['account_type'].title()
            return Response(data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'error': f'Failed to serialize bank account: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    if request.method == 'PUT':
        try:
            serializer = BankAccountCreateSerializer(bank_account, data=request.data, partial=True)
            if serializer.is_valid():
                updated = serializer.save()
                response_data = BankAccountListSerializer(updated).data
                # Format status and account_type
                if response_data.get('status'):
                    response_data['status'] = response_data['status'].title()
                if response_data.get('account_type'):
                    response_data['account_type'] = response_data['account_type'].title()
                return Response(response_data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'error': f'Failed to update bank account: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    # DELETE
    if request.method == 'DELETE':
        try:
            bank_account.delete()
            return Response({
                'detail': 'Bank account deleted successfully'
            }, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({
                'error': f'Failed to delete bank account: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def bank_account_names_list(request):
    """Get list of bank account names for dropdowns"""
    try:
        bank_accounts = BankAccount.objects.all()
        data = []
        for bank in bank_accounts:
            data.append({
                'id': bank.id,
                'account_holder_name': bank.account_holder_name,
                'bank_name': bank.bank_name,
                'name': f"{bank.account_holder_name} - {bank.bank_name}"  # For backward compatibility
            })
        return Response(data)
    except Exception as e:
        return Response({'error': f'Failed to fetch bank account names: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
