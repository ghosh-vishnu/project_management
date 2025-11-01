from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from .models import Invoice
from .serializers import InvoiceListSerializer, InvoiceCreateSerializer


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def invoice_list(request):
    """List all invoices or create a new invoice"""
    
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
            
            # Get all invoices
            queryset = Invoice.objects.select_related(
                'project', 'client', 'bank_account'
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
            serializer = InvoiceListSerializer(page_obj, many=True)
            data = serializer.data
            
            # Format status and payment_method for frontend display
            for item in data:
                status_val = item.get('status')
                if status_val:
                    item['status'] = status_val.replace('_', ' ').title()
                
                payment_method_val = item.get('payment_method')
                if payment_method_val:
                    item['payment_method'] = payment_method_val.replace('_', ' ').title()
            
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
                'error': f'Failed to fetch invoices: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    # POST - Create new invoice
    if request.method == 'POST':
        try:
            serializer = InvoiceCreateSerializer(data=request.data)
            if serializer.is_valid():
                invoice = serializer.save()
                # Return list serializer for consistent response
                response_data = InvoiceListSerializer(invoice).data
                # Format status and payment_method
                if response_data.get('status'):
                    response_data['status'] = response_data['status'].replace('_', ' ').title()
                if response_data.get('payment_method'):
                    response_data['payment_method'] = response_data['payment_method'].replace('_', ' ').title()
                return Response(response_data, status=status.HTTP_201_CREATED)
            # Return detailed serializer errors
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({
                'error': f'Failed to create invoice: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def invoice_detail(request, pk):
    """Get, update, or delete a specific invoice"""
    
    try:
        invoice = Invoice.objects.select_related(
            'project', 'client', 'bank_account'
        ).get(pk=pk)
    except Invoice.DoesNotExist:
        return Response({
            'error': 'Invoice not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': f'Error locating invoice: {str(e)}'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if request.method == 'GET':
        try:
            data = InvoiceListSerializer(invoice).data
            # Format status and payment_method
            if data.get('status'):
                data['status'] = data['status'].replace('_', ' ').title()
            if data.get('payment_method'):
                data['payment_method'] = data['payment_method'].replace('_', ' ').title()
            return Response(data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'error': f'Failed to serialize invoice: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    if request.method == 'PUT':
        try:
            serializer = InvoiceCreateSerializer(invoice, data=request.data, partial=True)
            if serializer.is_valid():
                updated = serializer.save()
                response_data = InvoiceListSerializer(updated).data
                # Format status and payment_method
                if response_data.get('status'):
                    response_data['status'] = response_data['status'].replace('_', ' ').title()
                if response_data.get('payment_method'):
                    response_data['payment_method'] = response_data['payment_method'].replace('_', ' ').title()
                return Response(response_data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'error': f'Failed to update invoice: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    # DELETE
    if request.method == 'DELETE':
        try:
            invoice.delete()
            return Response({
                'detail': 'Invoice deleted successfully'
            }, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({
                'error': f'Failed to delete invoice: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)
