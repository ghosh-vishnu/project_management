from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from .models import Contract
from .serializers import ContractListSerializer, ContractCreateSerializer


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def contract_list(request):
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

            queryset = Contract.objects.select_related('lead_name').all()
            paginator = Paginator(queryset, page_size)
            try:
                page_obj = paginator.page(page)
            except (EmptyPage, PageNotAnInteger):
                if page > paginator.num_pages:
                    page_obj = paginator.page(paginator.num_pages or 1)
                else:
                    page_obj = paginator.page(1)

            serializer = ContractListSerializer(page_obj, many=True)
            return Response({
                'count': paginator.count,
                'next': page_obj.next_page_number() if page_obj.has_next() else None,
                'previous': page_obj.previous_page_number() if page_obj.has_previous() else None,
                'results': serializer.data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': f'Failed to fetch contracts: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    try:
        serializer = ContractCreateSerializer(data=request.data)
        if serializer.is_valid():
            contract = serializer.save()
            return Response(ContractListSerializer(contract).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': f'Failed to create contract: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def contract_detail(request, pk: int):
    try:
        contract = Contract.objects.select_related('lead_name').get(pk=pk)
    except Contract.DoesNotExist:
        return Response({'error': 'Contract not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': f'Error locating contract: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'GET':
        try:
            return Response(ContractListSerializer(contract).data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': f'Failed to serialize contract: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    if request.method == 'PUT':
        try:
            serializer = ContractCreateSerializer(contract, data=request.data, partial=True)
            if serializer.is_valid():
                updated = serializer.save()
                return Response(ContractListSerializer(updated).data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': f'Failed to update contract: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        contract.delete()
        return Response({'detail': 'Contract deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
    except Exception as e:
        return Response({'error': f'Failed to delete contract: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)


