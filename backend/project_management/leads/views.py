from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from .models import Lead
from .serializers import (
    LeadListSerializer,
    LeadDetailSerializer,
    LeadCreateSerializer,
)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def lead_list(request):
    """List leads with pagination or create a new lead."""
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

            queryset = Lead.objects.select_related('assign_to', 'assign_to__user').all()

            paginator = Paginator(queryset, page_size)
            try:
                page_obj = paginator.page(page)
            except (EmptyPage, PageNotAnInteger):
                if page > paginator.num_pages:
                    page_obj = paginator.page(paginator.num_pages or 1)
                else:
                    page_obj = paginator.page(1)

            serializer = LeadListSerializer(page_obj, many=True)
            return Response({
                'count': paginator.count,
                'next': page_obj.next_page_number() if page_obj.has_next() else None,
                'previous': page_obj.previous_page_number() if page_obj.has_previous() else None,
                'results': serializer.data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': f'Failed to fetch leads: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # POST
    try:
        serializer = LeadCreateSerializer(data=request.data)
        if serializer.is_valid():
            lead = serializer.save()
            return Response(LeadDetailSerializer(lead).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': f'Failed to create lead: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def lead_detail(request, pk: int):
    """Retrieve, update, or delete a lead by id."""
    try:
        lead = Lead.objects.select_related('assign_to', 'assign_to__user').get(pk=pk)
    except Lead.DoesNotExist:
        return Response({'error': 'Lead not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': f'Error locating lead: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'GET':
        try:
            return Response(LeadDetailSerializer(lead).data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': f'Failed to serialize lead: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    if request.method == 'PUT':
        try:
            serializer = LeadCreateSerializer(lead, data=request.data, partial=True)
            if serializer.is_valid():
                updated = serializer.save()
                return Response(LeadDetailSerializer(updated).data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': f'Failed to update lead: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

    # DELETE
    try:
        lead.delete()
        return Response({'detail': 'Lead deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
    except Exception as e:
        return Response({'error': f'Failed to delete lead: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
