from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.core.paginator import Paginator
from django.db.models import Count
from .models import Team
from .serializers import TeamListSerializer, TeamDetailSerializer, TeamCreateSerializer


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def team_list(request):
    """Get paginated list of teams or create a new team"""
    
    if request.method == 'GET':
        try:
            # Get query parameters
            page = int(request.query_params.get('page', 1))
            page_size = int(request.query_params.get('page_size', 25))
            search = request.query_params.get('search', '').strip()
            is_active = request.query_params.get('is_active')
            
            # Filter teams
            teams = Team.objects.select_related('team_lead', 'team_lead__user').prefetch_related('members').all()
            
            # Apply search filter
            if search:
                teams = teams.filter(name__icontains=search)
            
            # Apply active filter
            if is_active is not None:
                is_active_bool = is_active.lower() in ('true', '1', 'yes')
                teams = teams.filter(is_active=is_active_bool)
            
            # Pagination
            paginator = Paginator(teams, page_size)
            page_obj = paginator.get_page(page)
            
            serializer = TeamListSerializer(page_obj, many=True)
            
            return Response({
                'count': paginator.count,
                'next': page_obj.next_page_number() if page_obj.has_next() else None,
                'previous': page_obj.previous_page_number() if page_obj.has_previous() else None,
                'results': serializer.data
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    elif request.method == 'POST':
        try:
            serializer = TeamCreateSerializer(data=request.data)
            if serializer.is_valid():
                team = serializer.save()
                detail_serializer = TeamDetailSerializer(team)
                return Response(detail_serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def team_detail(request, pk):
    """Get, update or delete a specific team"""
    try:
        team = Team.objects.select_related('team_lead', 'team_lead__user').prefetch_related('members', 'members__user').get(pk=pk)
    except Team.DoesNotExist:
        return Response(
            {'error': 'Team not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if request.method == 'GET':
        serializer = TeamDetailSerializer(team)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        try:
            serializer = TeamCreateSerializer(team, data=request.data, partial=True)
            if serializer.is_valid():
                updated_team = serializer.save()
                detail_serializer = TeamDetailSerializer(updated_team)
                return Response(detail_serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    elif request.method == 'DELETE':
        try:
            team.delete()
            return Response(
                {'detail': 'Team deleted successfully'},
                status=status.HTTP_204_NO_CONTENT
            )
        except Exception as e:
            return Response(
                {'error': f'Failed to delete team: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def team_stats(request):
    """Get team statistics"""
    try:
        total_teams = Team.objects.count()
        active_teams = Team.objects.filter(is_active=True).count()
        total_members = Team.objects.aggregate(
            total=Count('members')
        )['total'] or 0
        
        return Response({
            'total_teams': total_teams,
            'active_teams': active_teams,
            'inactive_teams': total_teams - active_teams,
            'total_members': total_members,
        })
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
