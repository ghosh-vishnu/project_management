from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from .models import Proposal
from .serializers import (
    ProposalListSerializer,
    ProposalDetailSerializer,
    ProposalCreateSerializer,
)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def proposal_list(request):
    """List proposals with pagination or create a new proposal."""
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

            queryset = Proposal.objects.all()

            paginator = Paginator(queryset, page_size)
            try:
                page_obj = paginator.page(page)
            except (EmptyPage, PageNotAnInteger):
                if page > paginator.num_pages:
                    page_obj = paginator.page(paginator.num_pages or 1)
                else:
                    page_obj = paginator.page(1)

            serializer = ProposalListSerializer(page_obj, many=True)
            return Response({
                'count': paginator.count,
                'next': page_obj.next_page_number() if page_obj.has_next() else None,
                'previous': page_obj.previous_page_number() if page_obj.has_previous() else None,
                'results': serializer.data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': f'Failed to fetch proposals: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # POST
    try:
        serializer = ProposalCreateSerializer(data=request.data)
        if serializer.is_valid():
            proposal = serializer.save()
            return Response(ProposalDetailSerializer(proposal).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': f'Failed to create proposal: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def proposal_detail(request, pk: int):
    """Retrieve, update, or delete a proposal by id."""
    try:
        proposal = Proposal.objects.get(pk=pk)
    except Proposal.DoesNotExist:
        return Response({'error': 'Proposal not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': f'Error locating proposal: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'GET':
        try:
            return Response(ProposalDetailSerializer(proposal).data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': f'Failed to serialize proposal: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    if request.method == 'PUT':
        try:
            serializer = ProposalCreateSerializer(proposal, data=request.data, partial=True)
            if serializer.is_valid():
                updated = serializer.save()
                return Response(ProposalDetailSerializer(updated).data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': f'Failed to update proposal: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

    # DELETE
    try:
        proposal.delete()
        return Response({'detail': 'Proposal deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
    except Exception as e:
        return Response({'error': f'Failed to delete proposal: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
