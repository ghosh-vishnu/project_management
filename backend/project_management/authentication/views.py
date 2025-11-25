from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from .serializers import UserLoginSerializer
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from employee.models import Employee, UserProfile
from employee.serializers import UserProfileSerializer

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    User login endpoint - Optimized for speed
    """
    email = request.data.get('email')
    password = request.data.get('password')
    
    if not email or not password:
        return Response(
            {"error": "Email and password are required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Direct query by email - faster
        user = User.objects.select_related().get(email=email)
        
        # Quick password check - faster than authenticate()
        if user.check_password(password) and user.is_active:
            # Get or create token
            token, _ = Token.objects.get_or_create(user=user)
            
            return Response({
                'accesToken': token.key,
                'user_id': user.id,
                'username': user.username,
                'email': user.email,
                'user_type': 'admin' if user.is_staff else 'user'
            }, status=status.HTTP_200_OK)
        else:
            return Response(
                {"error": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED
            )
            
    except User.DoesNotExist:
        return Response(
            {"error": "Invalid credentials"},
            status=status.HTTP_401_UNAUTHORIZED
        )

@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """
    User registration endpoint
    """
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')
    
    if not username or not email or not password:
        return Response(
            {"error": "Username, email and password are required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if User.objects.filter(username=username).exists():
        return Response(
            {"error": "Username already exists"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if User.objects.filter(email=email).exists():
        return Response(
            {"error": "Email already exists"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )
        token, _ = Token.objects.get_or_create(user=user)
        
        return Response({
            'accesToken': token.key,
            'user_id': user.id,
            'username': user.username,
            'email': user.email,
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password_view(request):
    """
    Password reset endpoint
    """
    email = request.data.get('email')
    new_password = request.data.get('new_password')
    
    if not email or not new_password:
        return Response(
            {"error": "Email and new password are required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        user = User.objects.get(email=email)
        user.set_password(new_password)
        user.save()
        
        return Response({
            "message": "Password reset successfully"
        }, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response(
            {"error": "User not found"},
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    """
    Get current user's profile information
    Returns user data and employee data if user is an employee
    """
    try:
        user = request.user
        
        # Basic user data
        profile_data = {
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_active': user.is_active,
                'is_staff': user.is_staff,
                'user_type': 'Admin' if user.is_staff else 'Employee',
            },
            'name': f"{user.first_name} {user.last_name}".strip() or user.username,
            'email': user.email,
        }
        
        # Try to get employee data if user is an employee
        try:
            employee = Employee.objects.select_related(
                'user', 'current_address', 'permanent_address',
                'bank_details', 'documents'
            ).get(user=user)
            
            # Add employee-specific data
            # Load user profile overrides if any
            user_profile = None
            try:
                user_profile = UserProfile.objects.get(user=user)
            except UserProfile.DoesNotExist:
                user_profile = None

            profile_data.update({
                'name': employee.name,
                'contact_no': employee.contact_no,
                'alternate_contact_no': employee.alternate_contact_no,
                'gender': employee.gender,
                'pan_no': employee.pan_no,
                'aadhar_no': employee.aadhar_no,
                'dob': employee.dob,
                'designation': (getattr(user_profile, 'designation', None) or '').strip() or employee.designation,
                'department': (getattr(user_profile, 'department', None) or '').strip() or employee.department,
                # Prefer user profile overrides if present
                'designation': employee.designation,
                'department': employee.department,
                'organization': getattr(user_profile, 'organization', None) or employee.organization,
                'joining_date': employee.joining_date,
                'basic_salary': employee.basic_salary,
                'is_active': employee.is_active,
                'current_address': {
                    'address': employee.current_address.address if employee.current_address else None,
                    'city': employee.current_address.city if employee.current_address else None,
                    'state': employee.current_address.state if employee.current_address else None,
                    'country': employee.current_address.country if employee.current_address else None,
                    'pincode': employee.current_address.pincode if employee.current_address else None,
                } if employee.current_address else None,
                'permanent_address': {
                    'address': employee.permanent_address.address if employee.permanent_address else None,
                    'city': employee.permanent_address.city if employee.permanent_address else None,
                    'state': employee.permanent_address.state if employee.permanent_address else None,
                    'country': employee.permanent_address.country if employee.permanent_address else None,
                    'pincode': employee.permanent_address.pincode if employee.permanent_address else None,
                } if employee.permanent_address else None,
                'documents': {
                    'photo': request.build_absolute_uri(employee.documents.photo.url) if employee.documents and employee.documents.photo else None,
                    'resume': request.build_absolute_uri(employee.documents.resume.url) if employee.documents and employee.documents.resume else None,
                    'aadhar_card': request.build_absolute_uri(employee.documents.aadhar_card.url) if employee.documents and employee.documents.aadhar_card else None,
                    'pan_card': request.build_absolute_uri(employee.documents.pan_card.url) if employee.documents and employee.documents.pan_card else None,
                    'higher_education_certificate': request.build_absolute_uri(employee.documents.higher_education_certificate.url) if employee.documents and employee.documents.higher_education_certificate else None,
                    'banner_image': request.build_absolute_uri(employee.documents.banner_image.url) if employee.documents and employee.documents.banner_image else None,
                } if employee.documents else None,
            })
            
        except Employee.DoesNotExist:
            # User is not an employee, return basic profile only
            pass
        
        return Response(profile_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': f'Failed to fetch profile: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def user_profile_view(request):
    """Create or update the current user's lightweight profile overrides."""
    try:
        user = request.user
        instance, _ = UserProfile.objects.get_or_create(user=user)

        if request.method in ['PUT', 'PATCH']:
            partial = request.method == 'PATCH'
            serializer = UserProfileSerializer(instance, data=request.data, partial=partial)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # GET
        serializer = UserProfileSerializer(instance)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password_view(request):
    """Change user password endpoint"""
    try:
        user = request.user
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        
        if not current_password or not new_password:
            return Response(
                {'error': 'Current password and new password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify current password
        if not user.check_password(current_password):
            return Response(
                {'error': 'Current password is incorrect'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate new password length
        if len(new_password) < 8:
            return Response(
                {'error': 'New password must be at least 8 characters long'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Set new password
        user.set_password(new_password)
        user.save()
        
        return Response(
            {'message': 'Password changed successfully'},
            status=status.HTTP_200_OK
        )
    except Exception as e:
        return Response(
            {'error': f'Failed to change password: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_recent_work_view(request):
    """Get user's recent work - tasks and sprint tasks"""
    try:
        from datetime import datetime, timedelta
        from django.utils import timezone
        from tasks.models import Task
        from sprint.models import SprintTask
        from employee.models import Employee
        
        user = request.user
        
        # Get employee record for this user
        employee = None
        try:
            employee = Employee.objects.get(user=user)
        except Employee.DoesNotExist:
            pass
        
        # Get tasks assigned to employee (last 90 days)
        recent_tasks = []
        if employee:
            ninety_days_ago = timezone.now() - timedelta(days=90)
            tasks = Task.objects.filter(
                assigned_to=employee,
                created_at__gte=ninety_days_ago
            ).select_related('project', 'assigned_to').order_by('-created_at')[:10]
            
            for task in tasks:
                recent_tasks.append({
                    'id': task.id,
                    'type': 'task',
                    'title': task.task_name,
                    'project': task.project.title if task.project else 'No Project',
                    'project_id': task.project.id if task.project else None,
                    'status': task.status,
                    'created_at': task.created_at.isoformat() if task.created_at else None,
                    'created_by': 'You created this',
                })
        
        # Get sprint tasks assigned to user (last 90 days)
        ninety_days_ago = timezone.now() - timedelta(days=90)
        sprint_tasks = SprintTask.objects.filter(
            assigned_to=user,
            created_at__gte=ninety_days_ago
        ).select_related('sprint', 'sprint__project', 'assigned_to').order_by('-created_at')[:10]
        
        for sprint_task in sprint_tasks:
            # Get project name from sprint's project, fallback to sprint name
            project_name = 'No Project'
            project_id = None
            if sprint_task.sprint and sprint_task.sprint.project:
                project_name = sprint_task.sprint.project.title
                project_id = sprint_task.sprint.project.id
            
            recent_tasks.append({
                'id': sprint_task.id,
                'type': 'sprint_task',
                'title': sprint_task.title,
                'project': project_name,
                'project_id': project_id,
                'sprint_id': sprint_task.sprint.id if sprint_task.sprint else None,
                'status': sprint_task.status,
                'created_at': sprint_task.created_at.isoformat() if sprint_task.created_at else None,
                'created_by': 'You created this',
            })
        
        # Sort by created_at (most recent first) and limit to 10
        recent_tasks.sort(key=lambda x: x['created_at'] or '', reverse=True)
        recent_tasks = recent_tasks[:10]
        
        # Format dates for display
        now = timezone.now()
        for task in recent_tasks:
            if task['created_at']:
                try:
                    created = datetime.fromisoformat(task['created_at'].replace('Z', '+00:00'))
                    if created.tzinfo is None:
                        created = timezone.make_aware(created)
                    delta = now - created
                    
                    if delta.days == 0:
                        task['time_ago'] = 'today'
                    elif delta.days == 1:
                        task['time_ago'] = 'yesterday'
                    elif delta.days < 7:
                        task['time_ago'] = f'{delta.days} days ago'
                    elif delta.days < 30:
                        weeks = delta.days // 7
                        task['time_ago'] = f'{weeks} week{"s" if weeks > 1 else ""} ago'
                    else:
                        months = delta.days // 30
                        task['time_ago'] = f'{months} month{"s" if months > 1 else ""} ago'
                except:
                    task['time_ago'] = 'recently'
            else:
                task['time_ago'] = 'recently'
        
        return Response({
            'results': recent_tasks,
            'count': len(recent_tasks)
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response(
            {'error': f'Failed to fetch recent work: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_projects_view(request):
    """Get projects the user has worked on (last 90 days)"""
    try:
        from datetime import timedelta
        from django.utils import timezone
        from tasks.models import Task
        from sprint.models import SprintTask, Sprint
        from employee.models import Employee
        from projects.models import Project
        
        user = request.user
        
        # Get employee record
        employee = None
        try:
            employee = Employee.objects.get(user=user)
        except Employee.DoesNotExist:
            pass
        
        # Get unique projects from tasks and sprint tasks
        project_ids = set()
        ninety_days_ago = timezone.now() - timedelta(days=90)
        
        # Get projects from regular tasks
        if employee:
            tasks = Task.objects.filter(
                assigned_to=employee,
                created_at__gte=ninety_days_ago,
                project__isnull=False
            ).values_list('project_id', flat=True).distinct()
            project_ids.update(tasks)
        
        # Get projects from sprint tasks (via sprint.project)
        sprint_tasks = SprintTask.objects.filter(
            assigned_to=user,
            created_at__gte=ninety_days_ago,
            sprint__project__isnull=False
        ).select_related('sprint').values_list('sprint__project_id', flat=True).distinct()
        project_ids.update(sprint_tasks)
        
        # Get project details
        projects = Project.objects.filter(id__in=project_ids).order_by('-id')[:10]
        
        projects_data = []
        for project in projects:
            projects_data.append({
                'id': project.id,
                'title': project.title,
                'description': project.description or '',
            })
        
        return Response({
            'results': projects_data,
            'count': len(projects_data)
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response(
            {'error': f'Failed to fetch projects: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def global_search_view(request):
    """Global search across all resources with auto-suggestions"""
    try:
        from django.db.models import Q
        from tasks.models import Task
        from sprint.models import SprintTask, Sprint
        from employee.models import Employee
        from projects.models import Project
        try:
            from teams.models import Team
        except ImportError:
            Team = None
        
        query = request.query_params.get('q', '').strip()
        limit = int(request.query_params.get('limit', 10))
        
        if not query or len(query) < 2:
            return Response({
                'results': [],
                'suggestions': [],
                'count': 0
            }, status=status.HTTP_200_OK)
        
        user = request.user
        
        # Get employee record
        employee = None
        try:
            employee = Employee.objects.get(user=user)
        except Employee.DoesNotExist:
            pass
        
        results = {
            'projects': [],
            'tasks': [],
            'sprint_tasks': [],
            'sprints': [],
            'employees': [],
            'teams': [],
        }
        
        # Search Projects
        projects = Project.objects.filter(
            Q(title__icontains=query) | Q(description__icontains=query)
        ).order_by('-id')[:limit]
        for project in projects:
            results['projects'].append({
                'id': project.id,
                'type': 'project',
                'title': project.title,
                'description': project.description[:100] if project.description else '',
                'status': project.status,
                'icon': '📁',
            })
        
        # Search Tasks (assigned to current user's employee)
        if employee:
            tasks = Task.objects.filter(
                Q(task_name__icontains=query) | Q(description__icontains=query),
                assigned_to=employee
            ).select_related('project').order_by('-created_at')[:limit]
            for task in tasks:
                results['tasks'].append({
                    'id': task.id,
                    'type': 'task',
                    'title': task.task_name,
                    'description': task.description[:100] if task.description else '',
                    'status': task.status,
                    'project': task.project.title if task.project else None,
                    'icon': '✓' if task.status == 'completed' else '📋',
                })
        
        # Search Sprint Tasks
        sprint_tasks = SprintTask.objects.filter(
            Q(title__icontains=query) | Q(description__icontains=query),
            assigned_to=user
        ).select_related('sprint', 'sprint__project').order_by('-created_at')[:limit]
        for task in sprint_tasks:
            project_name = None
            if task.sprint and task.sprint.project:
                project_name = task.sprint.project.title
            results['sprint_tasks'].append({
                'id': task.id,
                'type': 'sprint_task',
                'title': task.title,
                'description': task.description[:100] if task.description else '',
                'status': task.status,
                'sprint': task.sprint.name if task.sprint else None,
                'project': project_name,
                'icon': '✅' if task.status == 'done' else '🚀',
            })
        
        # Search Sprints
        sprints = Sprint.objects.filter(
            Q(name__icontains=query) | Q(description__icontains=query)
        ).select_related('project').order_by('-created_at')[:limit]
        for sprint in sprints:
            results['sprints'].append({
                'id': sprint.id,
                'type': 'sprint',
                'title': sprint.name,
                'description': sprint.description[:100] if sprint.description else '',
                'status': sprint.status,
                'project': sprint.project.title if sprint.project else None,
                'icon': '🏃',
            })
        
        # Search Employees (only names, limited to 5)
        employees = Employee.objects.filter(
            Q(name__icontains=query) | Q(department__icontains=query) | Q(designation__icontains=query)
        ).select_related('user')[:5]
        for emp in employees:
            results['employees'].append({
                'id': emp.id,
                'type': 'employee',
                'title': emp.name,
                'description': f"{emp.designation or ''} • {emp.department or ''}".strip(' • '),
                'icon': '👤',
            })
        
        # Search Teams
        if Team:
            try:
                teams = Team.objects.filter(
                    Q(name__icontains=query) | Q(note__icontains=query)
                )[:limit]
                for team in teams:
                    results['teams'].append({
                        'id': team.id,
                        'type': 'team',
                        'title': team.name,
                        'description': team.note[:100] if team.note else '',
                        'icon': '👥',
                    })
            except Exception:
                pass
        
        # Combine all results
        all_results = []
        all_results.extend(results['projects'])
        all_results.extend(results['tasks'])
        all_results.extend(results['sprint_tasks'])
        all_results.extend(results['sprints'])
        all_results.extend(results['employees'])
        if Team:
            all_results.extend(results['teams'])
        
        # Generate AI-powered suggestions based on query
        suggestions = _generate_search_suggestions(query, results)
        
        return Response({
            'results': all_results[:limit],
            'suggestions': suggestions,
            'count': len(all_results),
            'by_type': {
                'projects': len(results['projects']),
                'tasks': len(results['tasks']),
                'sprint_tasks': len(results['sprint_tasks']),
                'sprints': len(results['sprints']),
                'employees': len(results['employees']),
                'teams': len(results['teams']),
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response(
            {'error': f'Failed to search: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


def _generate_search_suggestions(query: str, results: dict) -> list:
    """Generate AI-powered search suggestions based on query and results"""
    suggestions = []
    query_lower = query.lower().strip()
    
    # Common search patterns mapping
    search_patterns = {
        'project': {
            'keywords': ['project', 'proj', 'work', 'work on', 'workspace', 'repo', 'repository'],
            'action': 'Show all projects',
            'icon': '📁',
            'route': '/projects'
        },
        'task': {
            'keywords': ['task', 'todo', 'work', 'assignment', 'job', 'issue', 'bug'],
            'action': 'Show my tasks',
            'icon': '📋',
            'route': '/tasks'
        },
        'sprint': {
            'keywords': ['sprint', 'agile', 'scrum', 'iteration', 'sprint planning'],
            'action': 'Show all sprints',
            'icon': '🏃',
            'route': '/sprints'
        },
        'team': {
            'keywords': ['team', 'member', 'people', 'employee', 'colleague', 'staff'],
            'action': 'Show teams',
            'icon': '👥',
            'route': '/teams'
        },
        'employee': {
            'keywords': ['employee', 'staff', 'worker', 'person', 'user'],
            'action': 'Show employees',
            'icon': '👤',
            'route': '/employee'
        },
    }
    
    # AI-powered pattern matching
    matched_patterns = []
    for pattern_name, pattern_data in search_patterns.items():
        if any(keyword in query_lower for keyword in pattern_data['keywords']):
            matched_patterns.append((pattern_name, pattern_data))
    
    # Add matched pattern suggestions
    for pattern_name, pattern_data in matched_patterns[:3]:  # Limit to 3 pattern matches
        suggestions.append({
            'text': pattern_data['action'],
            'type': 'action',
            'icon': pattern_data['icon'],
            'route': pattern_data['route']
        })
    
    # Smart contextual suggestions
    if 'show' in query_lower or 'open' in query_lower or 'view' in query_lower:
        # User wants to view something
        if 'project' in query_lower:
            suggestions.append({
                'text': 'Open Projects page',
                'type': 'action',
                'icon': '📁',
                'route': '/projects'
            })
        if 'task' in query_lower:
            suggestions.append({
                'text': 'Open Tasks page',
                'type': 'action',
                'icon': '📋',
                'route': '/tasks'
            })
        if 'sprint' in query_lower:
            suggestions.append({
                'text': 'Open Sprints page',
                'type': 'action',
                'icon': '🏃',
                'route': '/sprints'
            })
    
    # Quick search suggestion
    if len(query) >= 2 and not any(word in query_lower for word in ['show', 'open', 'view', 'go to']):
        suggestions.append({
            'text': f'Search for "{query}"',
            'type': 'search',
            'icon': '🔍',
            'query': query
        })
    
    # Add top results as suggestions
    if results.get('projects') and len(suggestions) < 4:
        top_project = results['projects'][0]
        suggestions.append({
            'text': f'Open "{top_project["title"]}"',
            'type': 'result',
            'icon': '📁',
            'data': top_project
        })
    
    if results.get('sprints') and len(suggestions) < 4:
        top_sprint = results['sprints'][0]
        suggestions.append({
            'text': f'Open "{top_sprint["title"]}" sprint',
            'type': 'result',
            'icon': '🏃',
            'data': top_sprint
        })
    
    # Popular shortcuts
    if len(query) < 3:
        suggestions.extend([
            {'text': 'Show all projects', 'type': 'action', 'icon': '📁', 'route': '/projects'},
            {'text': 'Show my tasks', 'type': 'action', 'icon': '📋', 'route': '/tasks'},
            {'text': 'Show sprints', 'type': 'action', 'icon': '🏃', 'route': '/sprints'},
        ])
    
    return suggestions[:6]  # Limit to 6 suggestions
