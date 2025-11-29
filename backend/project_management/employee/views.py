from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from django.db import transaction, models, models
from django.utils import timezone
from datetime import date, datetime, timedelta
from .models import Employee, Address, BankDetails, Documents
from .ai_services import DashboardAIService
from .serializers import (
    EmployeeListSerializer, EmployeeDetailSerializer, EmployeeCreateSerializer
)
from .resume_parser import parse_resume
from .ai_services import EmployeeAIService
from notifications.utils import notify_employee_added
import random
import string
import os
import tempfile
from datetime import datetime, timedelta
from django.utils import timezone


def generate_random_password(length=8):
    """Generate a random password"""
    characters = string.ascii_letters + string.digits
    return ''.join(random.choice(characters) for _ in range(length))


def get_value(key, default=''):
    """Helper function to get first item if list, else return the value"""
    if isinstance(key, list):
        return key[0] if key else default
    return key if key else default


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def employee_names_list(request):
    """Get list of employee names for dropdowns"""
    try:
        employees = Employee.objects.select_related('user').filter(is_active=True)
        data = []
        for emp in employees:
            try:
                email = emp.user.email if emp.user and hasattr(emp.user, 'email') else ''
                data.append({
                    'id': getattr(emp, 'id', None),
                    'name': getattr(emp, 'name', '') or '',
                    'email': email,
                    'designation': getattr(emp, 'designation', '') or ''
                })
            except Exception as row_error:
                # Skip bad rows but report minimal info for observability
                data.append({
                    'id': getattr(emp, 'id', None),
                    'name': '',
                    'email': '',
                    'designation': ''
                })
        return Response(data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@transaction.atomic
def create_employee(request):
    """
    Create an employee with user account.
    Email will be used as login credential.
    """
    try:
        # Parse nested FormData structure
        data = {}
        for key, value in request.data.items():
            # Handle nested keys like "user.email" -> {"user": {"email": value}}
            if '.' in key:
                parts = key.split('.')
                if len(parts) == 2:
                    if parts[0] not in data:
                        data[parts[0]] = {}
                    data[parts[0]][parts[1]] = value
                else:
                    data[key] = value
            else:
                data[key] = value
        
        # Extract user data (from nested format like "user.email")
        email = data.get('user', {}).get('email') if isinstance(data.get('user'), dict) else data.get('email')
        password = data.get('user', {}).get('password') if isinstance(data.get('user'), dict) else data.get('password')
        is_active_str = data.get('user', {}).get('is_active', 'true') if isinstance(data.get('user'), dict) else data.get('is_active', 'true')
        
        # Ensure email and password are strings, not lists
        if isinstance(email, list):
            email = email[0] if email else ''
        if isinstance(password, list):
            password = password[0] if password else ''
            
        is_active = str(is_active_str[0] if isinstance(is_active_str, list) else is_active_str).lower() in ('true', '1', 'yes')
        
        if not email or not password:
            return Response(
                {'error': 'Email and password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user with email already exists
        if User.objects.filter(email=email).exists():
            return Response(
                {'user': {'email': ['A user with this email already exists.']}},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create user
        username = email.split('@')[0]  # Use email prefix as username
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            is_active=is_active
        )
        
        # Handle current address
        current_address = None
        current_addr = data.get('current_address', {})
        if isinstance(current_addr, dict) and current_addr.get('address'):
            current_address = Address.objects.create(
                address=get_value(current_addr.get('address', '')),
                city=get_value(current_addr.get('city', '')),
                state=get_value(current_addr.get('state', '')),
                country=get_value(current_addr.get('country', '')),
                pincode=get_value(current_addr.get('pincode', '')),
                address_type='current'
            )
        
        # Handle permanent address
        permanent_address = None
        permanent_addr = data.get('permanent_address', {})
        if isinstance(permanent_addr, dict) and permanent_addr.get('address'):
            permanent_address = Address.objects.create(
                address=get_value(permanent_addr.get('address', '')),
                city=get_value(permanent_addr.get('city', '')),
                state=get_value(permanent_addr.get('state', '')),
                country=get_value(permanent_addr.get('country', '')),
                pincode=get_value(permanent_addr.get('pincode', '')),
                address_type='permanent'
            )
        
        # Handle bank details
        bank_details = None
        bank_data = data.get('bank_details', {})
        if isinstance(bank_data, dict) and bank_data.get('account_holder_name'):
            bank_details = BankDetails.objects.create(
                account_holder_name=get_value(bank_data.get('account_holder_name', '')),
                account_number=get_value(bank_data.get('account_number', '')),
                bank_name=get_value(bank_data.get('bank_name', '')),
                ifsc_code=get_value(bank_data.get('ifsc_code', '')),
                branch=get_value(bank_data.get('branch', '')),
            )
        
        # Handle documents (files)
        documents = None
        if any(key.startswith('documents.') for key in request.FILES):
            documents = Documents.objects.create()
            if 'documents.photo' in request.FILES:
                documents.photo = request.FILES['documents.photo']
            if 'documents.pan_card' in request.FILES:
                documents.pan_card = request.FILES['documents.pan_card']
            if 'documents.higher_education_certificate' in request.FILES:
                documents.higher_education_certificate = request.FILES['documents.higher_education_certificate']
            documents.save()
        
        # Get department and designation
        department_name = get_value(data.get('department_id', ''))
        designation_name = get_value(data.get('designation_id', ''))
        
        # Department mapping
        department_mapping = {
            '0': 'Project Management', '1': 'Development', '2': 'Design', 
            '3': 'Quality Assurance', '4': 'Human Resources', 
            '5': 'Sales & Marketing', '6': 'Support & Operations',
            '7': 'Finance & Accounts', '8': 'Support & Operations', 
            '9': 'IT Infrastructure', '10': 'Research & Innovation'
        }
        
        # Designation mapping based on department
        designation_mapping = {
            'Project Management': {'0': 'Project Manager', '1': 'Assistant Project Manager', '2': 'Project Coordinator', '3': 'Project Analyst'},
            'Development': {'0': 'Full Stack Developer', '1': 'Backend Developer (Python/Django)', '2': 'Frontend Developer (React/Angular)', '3': 'Software Engineer', '4': 'Intern Developer'},
            'Design': {'0': 'UI/UX Designer', '1': 'Graphic Designer', '2': 'Frontend Designer', '3': 'Creative Lead'},
            'Quality Assurance': {'0': 'QA Engineer', '1': 'QA Lead', '2': 'Software Tester', '3': 'Automation Tester'},
            'Human Resources': {'0': 'HR Manager', '1': 'HR Executive', '2': 'Talent Acquisition Specialist'},
            'Sales & Marketing': {'0': 'Business Development Executive', '1': 'Sales Manager', '2': 'Digital Marketing Executive', '3': 'SEO Specialist'},
            'Finance & Accounts': {'0': 'Accounts Executive', '1': 'Finance Officer', '2': 'Billing & Payroll Executive'},
            'Support & Operations': {'0': 'Support Engineer', '1': 'Technical Support Executive', '2': 'Operations Manager'},
            'IT Infrastructure': {'0': 'System Administrator', '1': 'Network Engineer', '2': 'Cloud Administrator'},
            'Research & Innovation': {'0': 'R&D Specialist', '1': 'Product Researcher', '2': 'Data Analyst'},
        }
        
        # Get department name
        dept_name = department_mapping.get(str(department_name), department_name)
        
        # Get designation name
        desig_name = ''
        if dept_name in designation_mapping:
            desig_map = designation_mapping[dept_name]
            desig_name = desig_map.get(str(designation_name), designation_name)
        else:
            desig_name = designation_name
        
        # Prevent old format from being saved
        if desig_name.startswith('desig-'):
            # Extract correct designation from old format
            parts = desig_name.split('-')
            if len(parts) >= 3:
                old_dept = parts[1]
                old_index = parts[2]
                if old_dept in designation_mapping and old_index in designation_mapping[old_dept]:
                    desig_name = designation_mapping[old_dept][old_index]
        
        # Create employee with proper value extraction
        employee = Employee.objects.create(
            user=user,
            name=get_value(data.get('name', '')),
            father_name=get_value(data.get('father_name', '')),
            contact_no=get_value(data.get('contact_no', '')),
            alternate_contact_no=get_value(data.get('alternate_contact_no', '')) or None,
            gender=get_value(data.get('gender', '')),
            pan_no=get_value(data.get('pan_no', '')),
            aadhar_no=get_value(data.get('aadhar_no', '')),
            dob=get_value(data.get('dob', '')) or None,
            joining_date=get_value(data.get('joining_date', '')),
            basic_salary=float(get_value(data.get('basic_salary', 0))) if get_value(data.get('basic_salary', 0)) else 0,
            is_active=is_active,
            department=dept_name,
            designation=desig_name,
            current_address=current_address,
            permanent_address=permanent_address,
            bank_details=bank_details,
            documents=documents,
        )
        
        # Send notification to admin users about new employee
        try:
            admin_users = User.objects.filter(is_staff=True, is_active=True)
            for admin_user in admin_users:
                notify_employee_added(
                    user=admin_user,
                    employee_name=employee.name or 'New Employee',
                    employee_id=employee.id
                )
        except Exception as notify_error:
            # Don't fail employee creation if notification fails
            print(f"Notification error: {notify_error}")
        
        # Return created employee data
        serializer = EmployeeDetailSerializer(employee)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def employee_detail(request, pk):
    """Get, update, or delete a specific employee"""
    try:
        employee = Employee.objects.select_related(
            'user', 'current_address', 'permanent_address', 
            'bank_details', 'documents'
        ).get(pk=pk)
    except Employee.DoesNotExist:
        return Response(
            {'error': 'Employee not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if request.method == 'GET':
        serializer = EmployeeDetailSerializer(employee)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method == 'PUT':
        try:
            # Parse nested FormData structure
            data = {}
            for key, value in request.data.items():
                if '.' in key:
                    parts = key.split('.')
                    if len(parts) == 2:
                        if parts[0] not in data:
                            data[parts[0]] = {}
                        data[parts[0]][parts[1]] = value
                    else:
                        data[key] = value
                else:
                    data[key] = value
        
            # Update user if email/password provided
            if 'user' in data or 'email' in data:
                email = data.get('user', {}).get('email') if isinstance(data.get('user'), dict) else data.get('email')
                password = data.get('user', {}).get('password') if isinstance(data.get('user'), dict) else data.get('password')
                is_active_str = data.get('user', {}).get('is_active') if isinstance(data.get('user'), dict) else data.get('is_active')
                
                if email and employee.user.email != email:
                    if User.objects.filter(email=email).exclude(id=employee.user.id).exists():
                        return Response(
                            {'error': 'Email already exists'},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    employee.user.email = email
                    employee.user.username = email.split('@')[0]
                
                if password:
                    employee.user.set_password(password)
                
                if is_active_str is not None:
                    is_active = str(is_active_str).lower() in ('true', '1', 'yes')
                    employee.user.is_active = is_active
                    employee.is_active = is_active
                
                employee.user.save()
            
            # Update addresses
            if 'current_address' in data:
                addr_data = data['current_address']
                if isinstance(addr_data, dict):
                    if employee.current_address:
                        employee.current_address.address = get_value(addr_data.get('address', ''))
                        employee.current_address.city = get_value(addr_data.get('city', ''))
                        employee.current_address.state = get_value(addr_data.get('state', ''))
                        employee.current_address.country = get_value(addr_data.get('country', ''))
                        employee.current_address.pincode = get_value(addr_data.get('pincode', ''))
                        employee.current_address.save()
                    elif addr_data.get('address'):
                        employee.current_address = Address.objects.create(
                            address=get_value(addr_data.get('address', '')),
                            city=get_value(addr_data.get('city', '')),
                            state=get_value(addr_data.get('state', '')),
                            country=get_value(addr_data.get('country', '')),
                            pincode=get_value(addr_data.get('pincode', '')),
                            address_type='current'
                        )
            
            if 'permanent_address' in data:
                addr_data = data['permanent_address']
                if isinstance(addr_data, dict):
                    if employee.permanent_address:
                        employee.permanent_address.address = get_value(addr_data.get('address', ''))
                        employee.permanent_address.city = get_value(addr_data.get('city', ''))
                        employee.permanent_address.state = get_value(addr_data.get('state', ''))
                        employee.permanent_address.country = get_value(addr_data.get('country', ''))
                        employee.permanent_address.pincode = get_value(addr_data.get('pincode', ''))
                        employee.permanent_address.save()
                    elif addr_data.get('address'):
                        employee.permanent_address = Address.objects.create(
                            address=get_value(addr_data.get('address', '')),
                            city=get_value(addr_data.get('city', '')),
                            state=get_value(addr_data.get('state', '')),
                            country=get_value(addr_data.get('country', '')),
                            pincode=get_value(addr_data.get('pincode', '')),
                            address_type='permanent'
                        )
            
            # Update bank details
            if 'bank_details' in data:
                bank_data = data['bank_details']
                if isinstance(bank_data, dict) and bank_data.get('account_holder_name'):
                    if employee.bank_details:
                        employee.bank_details.account_holder_name = get_value(bank_data.get('account_holder_name', ''))
                        employee.bank_details.account_number = get_value(bank_data.get('account_number', ''))
                        employee.bank_details.bank_name = get_value(bank_data.get('bank_name', ''))
                        employee.bank_details.ifsc_code = get_value(bank_data.get('ifsc_code', ''))
                        employee.bank_details.branch = get_value(bank_data.get('branch', ''))
                        employee.bank_details.save()
                    else:
                        employee.bank_details = BankDetails.objects.create(
                            account_holder_name=get_value(bank_data.get('account_holder_name', '')),
                            account_number=get_value(bank_data.get('account_number', '')),
                            bank_name=get_value(bank_data.get('bank_name', '')),
                            ifsc_code=get_value(bank_data.get('ifsc_code', '')),
                            branch=get_value(bank_data.get('branch', '')),
                        )
            
            # Update documents
            if any(key.startswith('documents.') for key in request.FILES):
                if not employee.documents:
                    employee.documents = Documents.objects.create()
                if 'documents.photo' in request.FILES:
                    employee.documents.photo = request.FILES['documents.photo']
                if 'documents.pan_card' in request.FILES:
                    employee.documents.pan_card = request.FILES['documents.pan_card']
                if 'documents.higher_education_certificate' in request.FILES:
                    employee.documents.higher_education_certificate = request.FILES['documents.higher_education_certificate']
                employee.documents.save()
            
            # Update basic fields
            if 'name' in data:
                employee.name = get_value(data.get('name', ''))
            if 'father_name' in data:
                employee.father_name = get_value(data.get('father_name', ''))
            if 'contact_no' in data:
                employee.contact_no = get_value(data.get('contact_no', ''))
            if 'alternate_contact_no' in data:
                employee.alternate_contact_no = get_value(data.get('alternate_contact_no', '')) or None
            if 'gender' in data:
                employee.gender = get_value(data.get('gender', ''))
            if 'pan_no' in data:
                employee.pan_no = get_value(data.get('pan_no', ''))
            if 'aadhar_no' in data:
                employee.aadhar_no = get_value(data.get('aadhar_no', ''))
            if 'dob' in data:
                employee.dob = get_value(data.get('dob', '')) or None
            if 'joining_date' in data:
                employee.joining_date = get_value(data.get('joining_date', ''))
            if 'basic_salary' in data:
                employee.basic_salary = float(get_value(data.get('basic_salary', 0))) if get_value(data.get('basic_salary', 0)) else 0
            
            # Update department and designation
            if 'department_id' in data:
                department_name = get_value(data.get('department_id', ''))
                department_mapping = {
                    '0': 'Project Management', '1': 'Development', '2': 'Design', 
                    '3': 'Quality Assurance', '4': 'Human Resources', 
                    '5': 'Sales & Marketing', '6': 'Support & Operations',
                    '7': 'Finance & Accounts', '8': 'Support & Operations', 
                    '9': 'IT Infrastructure', '10': 'Research & Innovation'
                }
                dept_name = department_mapping.get(str(department_name), department_name)
                employee.department = dept_name
            
            if 'designation_id' in data:
                designation_name = get_value(data.get('designation_id', ''))
                designation_mapping = {
                    'Project Management': {'0': 'Project Manager', '1': 'Assistant Project Manager', '2': 'Project Coordinator', '3': 'Project Analyst'},
                    'Development': {'0': 'Full Stack Developer', '1': 'Backend Developer (Python/Django)', '2': 'Frontend Developer (React/Angular)', '3': 'Software Engineer', '4': 'Intern Developer'},
                    'Design': {'0': 'UI/UX Designer', '1': 'Graphic Designer', '2': 'Frontend Designer', '3': 'Creative Lead'},
                    'Quality Assurance': {'0': 'QA Engineer', '1': 'QA Lead', '2': 'Software Tester', '3': 'Automation Tester'},
                    'Human Resources': {'0': 'HR Manager', '1': 'HR Executive', '2': 'Talent Acquisition Specialist'},
                    'Sales & Marketing': {'0': 'Business Development Executive', '1': 'Sales Manager', '2': 'Digital Marketing Executive', '3': 'SEO Specialist'},
                    'Finance & Accounts': {'0': 'Accounts Executive', '1': 'Finance Officer', '2': 'Billing & Payroll Executive'},
                    'Support & Operations': {'0': 'Support Engineer', '1': 'Technical Support Executive', '2': 'Operations Manager'},
                    'IT Infrastructure': {'0': 'System Administrator', '1': 'Network Engineer', '2': 'Cloud Administrator'},
                    'Research & Innovation': {'0': 'R&D Specialist', '1': 'Product Researcher', '2': 'Data Analyst'},
                }
                dept_name = employee.department
                if dept_name in designation_mapping:
                    desig_map = designation_mapping[dept_name]
                    desig_name = desig_map.get(str(designation_name), designation_name)
                    employee.designation = desig_name
                else:
                    employee.designation = designation_name
            
            employee.save()
            
            serializer = EmployeeDetailSerializer(employee)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    elif request.method == 'DELETE':
        employee.delete()
        return Response(
            {'message': 'Employee deleted successfully'},
            status=status.HTTP_200_OK
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def employee_list(request):
    """List all employees with pagination"""
    try:
        # Get pagination parameters
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 25))
        show_inactive = request.query_params.get('show_inactive', 'false').lower() == 'true'
        
        # Build queryset
        queryset = Employee.objects.select_related(
            'user', 'current_address', 'permanent_address', 
            'bank_details', 'documents'
        ).all()
        
        if not show_inactive:
            queryset = queryset.filter(is_active=True)
        
        # Calculate pagination
        total = queryset.count()
        start = (page - 1) * page_size
        end = start + page_size
        employees = queryset[start:end]
        
        # Serialize
        serializer = EmployeeListSerializer(employees, many=True)

        return Response({
            'count': total,
            'results': serializer.data,
            'page': page,
            'page_size': page_size
            }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_summary(request):
    """Get dashboard summary statistics"""
    try:
        # Count employees
        total_employees = Employee.objects.count()
        active_employees = Employee.objects.filter(is_active=True).count()
        
        # Live counts for projects and clients
        try:
            from projects.models import Project
            projects_count = Project.objects.count()
            ongoing_projects = Project.objects.filter(status='in_progress').count()
        except Exception:
            projects_count = 0
            ongoing_projects = 0
            
        try:
            from clients.models import Client
            clients_count = Client.objects.count()
        except Exception:
            clients_count = 0

        # Task statistics
        try:
            from tasks.models import Task
            total_tasks = Task.objects.count()
            completed_tasks = Task.objects.filter(status='completed').count()
            pending_tasks = Task.objects.filter(status__in=['todo', 'in_progress', 'review', 'testing']).count()
        except Exception:
            total_tasks = 0
            completed_tasks = 0
            pending_tasks = 0

        summary_data = {
            'employees': total_employees,
            'projects': projects_count,
            'ongoing_projects': ongoing_projects,
            'tasks': total_tasks,
            'completed_tasks': completed_tasks,
            'pending_tasks': pending_tasks,
            'clients': clients_count,
            'active_employees': active_employees,
            'inactive_employees': total_employees - active_employees,
        }
        
        return Response(summary_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': f'Error fetching dashboard summary: {str(e)}',
            'employees': 0,
            'projects': 0,
            'ongoing_projects': 0,
            'tasks': 0,
            'completed_tasks': 0,
            'pending_tasks': 0,
            'clients': 0,
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_project_progress(request):
    """Get project progress data for dashboard"""
    try:
        from projects.models import Project
        from tasks.models import Task
        
        projects = Project.objects.all()[:10]  # Get top 10 projects
        project_progress = []
        
        for project in projects:
            # Calculate progress based on tasks
            project_tasks = Task.objects.filter(project=project)
            total_tasks = project_tasks.count()
            
            if total_tasks > 0:
                completed_tasks = project_tasks.filter(status='completed').count()
                progress_percentage = int((completed_tasks / total_tasks) * 100)
            else:
                # If no tasks, calculate based on dates
                if project.start_date and project.end_date:
                    today = timezone.now().date()
                    total_days = (project.end_date - project.start_date).days
                    if total_days > 0:
                        elapsed_days = (today - project.start_date).days
                        progress_percentage = min(100, max(0, int((elapsed_days / total_days) * 100)))
                    else:
                        progress_percentage = 0
                else:
                    progress_percentage = 0
            
            project_progress.append({
                'id': project.id,
                'name': project.title,
                'progress': progress_percentage,
                'status': project.status,
            })
        
        # Sort by progress descending
        project_progress.sort(key=lambda x: x['progress'], reverse=True)

        return Response({
            'projects': project_progress
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({
            'error': f'Error fetching project progress: {str(e)}',
            'projects': []
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_weekly_progress(request):
    """Get weekly progress data for line chart"""
    try:
        from tasks.models import Task
        from datetime import datetime, timedelta
        
        # Get last 7 days
        today = timezone.now().date()
        week_data = []
        
        for i in range(6, -1, -1):  # Last 7 days including today
            date = today - timedelta(days=i)
            day_name = date.strftime('%a')  # Mon, Tue, etc.
            
            # Count tasks created up to this date
            tasks_until_date = Task.objects.filter(created_at__date__lte=date)
            total_tasks = tasks_until_date.count()
            completed_tasks = tasks_until_date.filter(status='completed').count()
            
            # Calculate progress percentage
            if total_tasks > 0:
                progress = int((completed_tasks / total_tasks) * 100)
            else:
                progress = 0
            
            week_data.append({
                'week': day_name,
                'progress': progress
            })
        
        return Response({
            'data': week_data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': f'Error fetching weekly progress: {str(e)}',
            'data': []
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_status_percentage(request):
    """Get overall status percentage for donut chart"""
    try:
        from tasks.models import Task
        
        total_tasks = Task.objects.count()
        completed_tasks = Task.objects.filter(status='completed').count()
        
        if total_tasks > 0:
            completion_percentage = int((completed_tasks / total_tasks) * 100)
            remaining_percentage = 100 - completion_percentage
        else:
            completion_percentage = 0
            remaining_percentage = 100
        
        return Response({
            'completion_percentage': completion_percentage,
            'remaining_percentage': remaining_percentage,
            'total_tasks': total_tasks,
            'completed_tasks': completed_tasks
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': f'Error fetching status percentage: {str(e)}',
            'completion_percentage': 0,
            'remaining_percentage': 100
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_kanban_data(request):
    """Get comprehensive Kanban dashboard data"""
    try:
        from projects.models import Project
        from tasks.models import Task
        from django.contrib.auth.models import User
        from datetime import date, timedelta
        
        today = timezone.now().date()
        
        # Project by Status
        project_status_data = {
            'in_progress': Project.objects.filter(status='in_progress').count(),
            'completed': Project.objects.filter(status='completed').count(),
            'planning': Project.objects.filter(status='planning').count(),
            'paused': Project.objects.filter(status='paused').count(),
            'cancelled': Project.objects.filter(status='cancelled').count(),
            'not_started': Project.objects.filter(status='not_started').count(),
        }
        
        # Project by Due Date
        projects = Project.objects.all()
        on_time = 0
        due = 0
        over_due = 0
        due_projects = []
        over_due_projects = []
        
        for project in projects:
            if project.end_date:
                days_remaining = (project.end_date - today).days
                if days_remaining < 0:
                    over_due += 1
                    if len(over_due_projects) < 6:
                        over_due_projects.append({'id': project.id, 'name': project.title})
                elif days_remaining <= 7:
                    due += 1
                    if len(due_projects) < 6:
                        due_projects.append({'id': project.id, 'name': project.title})
                else:
                    on_time += 1
        
        # Combine due and over due projects for display (prioritize over due)
        all_due_projects = over_due_projects + due_projects
        
        # Workload calculation (based on tasks per employee)
        employees = Employee.objects.filter(is_active=True)
        total_tasks = Task.objects.count()
        active_employees = employees.count()
        
        if active_employees > 0:
            # Count employees in each category based on their task count
            # Healthy range: 5-15 tasks per employee
            healthy_count = 0
            underutilised_count = 0
            overutilised_count = 0
            
            for emp in employees:
                task_count = Task.objects.filter(assigned_to=emp).count()
                if task_count < 5:
                    underutilised_count += 1
                elif task_count > 15:
                    overutilised_count += 1
                else:
                    healthy_count += 1
            
            total_workload = healthy_count + underutilised_count + overutilised_count
            
            if total_workload > 0:
                # Calculate percentages with proper rounding to ensure they add up to 100%
                healthy_percent = round((healthy_count / total_workload) * 100)
                underutilised_percent = round((underutilised_count / total_workload) * 100)
                overutilised_percent = 100 - healthy_percent - underutilised_percent
                
                # Ensure no negative values
                if overutilised_percent < 0:
                    overutilised_percent = 0
            else:
                # Default values when no employees have tasks
                healthy_percent = 0
                underutilised_percent = 100
                overutilised_percent = 0
        else:
            # Default values when no active employees
            healthy_percent = 0
            underutilised_percent = 0
            overutilised_percent = 0
        
        # Project by Project Manager
        # Group by email (unique identifier) but display name
        project_managers = {}
        for project in projects:
            if project.assigned_to:
                user = project.assigned_to
                # Use email as unique key for counting
                user_email = user.email if user.email else user.username
                
                # Get proper name for display - prefer Employee model name, then User full name, then first name, then formatted username
                pm_name = None
                
                # First priority: Check if user has Employee profile with name
                try:
                    if hasattr(user, 'employee_profile'):
                        employee = user.employee_profile
                        if employee and employee.name:
                            pm_name = employee.name
                except Exception:
                    pass
                
                # Second priority: User's full name
                if not pm_name and user.get_full_name():
                    pm_name = user.get_full_name()
                
                # Third priority: User's first name
                if not pm_name and user.first_name:
                    pm_name = user.first_name
                
                # Last resort: Format username
                if not pm_name:
                    username = user.username
                    if '@' in username:
                        # Remove email domain and format
                        pm_name = username.split('@')[0].replace('.', ' ').replace('_', ' ').title()
                    else:
                        # Format username by replacing dots and underscores with spaces
                        pm_name = username.replace('.', ' ').replace('_', ' ').title()
                
                # Use email as key for counting (unique identifier)
                # Store name for display (will use the first/latest name found)
                if user_email:
                    if user_email not in project_managers:
                        project_managers[user_email] = {
                            'name': pm_name or user_email,
                            'count': 0
                        }
                    # Increment count for this email
                    project_managers[user_email]['count'] += 1
        
        # Convert to list format and sort by count
        manager_data = [
            {'name': data['name'], 'count': data['count']} 
            for email, data in project_managers.items()
        ]
        # Sort by count descending and get top 5
        sorted_managers = sorted(manager_data, key=lambda x: x['count'], reverse=True)[:5]
        manager_data = sorted_managers
        
        # Financial data - Calculate from actual Income, Expense, and Invoice models
        try:
            from finance.models import Income, Expense
            from invoices.models import Invoice
            
            # Actual Revenue: Sum of all income amounts
            total_revenue = float(Income.objects.aggregate(
                total=models.Sum('amount')
            )['total'] or 0)
            
            # Planned Revenue: Sum of all invoice amounts (what we expect to receive)
            # This is dynamic - based on actual invoices created
            planned_revenue = float(Invoice.objects.aggregate(
                total=models.Sum('amount')
            )['total'] or 0)
            
            # If no invoices, use project budgets as planned revenue (also dynamic)
            if planned_revenue == 0:
                planned_revenue = sum(float(p.budget) for p in projects if p.budget) if projects.exists() else 0
            
            # Only use estimate if we have NO data at all (both invoices and budgets are 0)
            # This means: if we have actual revenue but no planned data, estimate 20% growth
            if planned_revenue == 0 and total_revenue > 0:
                # Estimate: Assume 20% growth target (more realistic than 33%)
                planned_revenue = total_revenue * 1.20
            elif planned_revenue == 0:
                # No data at all - set to 0 instead of random estimate
                planned_revenue = 0
            
            # Actual Cost: Sum of all expense amounts
            total_cost = float(Expense.objects.aggregate(
                total=models.Sum('amount')
            )['total'] or 0)
            
            # Planned Cost: Calculate from actual expenses with realistic growth
            # If we have actual expenses, plan for 10% increase (more realistic)
            if total_cost > 0:
                # Dynamic: Based on actual expenses, plan for 10% increase
                planned_cost = total_cost * 1.10
            elif planned_revenue > 0:
                # If no expenses but we have planned revenue, estimate cost as 25% of revenue
                # This is a standard business ratio (cost should be 20-30% of revenue)
                planned_cost = planned_revenue * 0.25
            else:
                # No data - set to 0
                planned_cost = 0
            
            # Calculate margins
            total_margin = total_revenue - total_cost
            planned_margin = planned_revenue - planned_cost
            
        except ImportError:
            # Fallback if models don't exist
            total_revenue = sum(float(p.budget) for p in projects if p.budget) if projects.exists() else 0
            planned_revenue = total_revenue * 1.33 if total_revenue > 0 else 0
            total_cost = total_revenue * 0.27 if total_revenue > 0 else 0
            planned_cost = total_revenue * 1.13 if total_revenue > 0 else 0
            total_margin = total_revenue - total_cost
            planned_margin = planned_revenue - planned_cost
        except Exception as e:
            # Error handling
            total_revenue = sum(float(p.budget) for p in projects if p.budget) if projects.exists() else 0
            planned_revenue = total_revenue * 1.33 if total_revenue > 0 else 0
            total_cost = total_revenue * 0.27 if total_revenue > 0 else 0
            planned_cost = total_revenue * 1.13 if total_revenue > 0 else 0
            total_margin = total_revenue - total_cost
            planned_margin = planned_revenue - planned_cost
        
        return Response({
            'project_status': project_status_data,
            'project_due_date': {
                'on_time': on_time,
                'due': due,
                'over_due': over_due,
                'due_projects': all_due_projects[:6],  # Show up to 6 projects (over due first, then due)
                'over_due_projects': over_due_projects[:3],  # Top 3 over due projects
                'due_soon_projects': due_projects[:3]  # Top 3 due soon projects
            },
            'workload': {
                'healthy': healthy_percent,
                'underutilised': underutilised_percent,
                'overutilised': overutilised_percent
            },
            'project_managers': manager_data,
            'financial': {
                'total_projects': {
                    'actual': projects.count(),
                    # Planned: If we have projects, calculate based on active/in-progress projects
                    # Assume we plan to complete current projects + add 50% more
                    'planned': int(projects.filter(status__in=['in_progress', 'planning', 'not_started']).count() * 1.5) + projects.filter(status='completed').count() if projects.exists() else 0
                },
                'total_revenue': {
                    'actual': round(total_revenue, 2),
                    'planned': round(planned_revenue, 2)
                },
                'total_cost': {
                    'actual': round(total_cost, 2),
                    'planned': round(planned_cost, 2)
                },
                'total_margin': {
                    'actual': round(total_margin, 2),
                    'planned': round(planned_margin, 2)
                }
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': f'Error fetching Kanban data: {str(e)}',
            'project_status': {},
            'project_due_date': {'on_time': 0, 'due': 0, 'over_due': 0, 'due_projects': []},
            'workload': {'healthy': 85, 'underutilised': 13, 'overutilised': 2},
            'project_managers': [],
            'financial': {}
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_ai_insights(request):
    """Get AI-powered dashboard insights"""
    try:
        from projects.models import Project
        from tasks.models import Task
        from employee.models import Employee
        
        # Get recent projects
        recent_projects = Project.objects.filter(status='in_progress').order_by('-start_date')[:5]
        
        insights = []
        
        for project in recent_projects:
            project_tasks = Task.objects.filter(project=project)
            total_tasks = project_tasks.count()
            completed_tasks = project_tasks.filter(status='completed').count()
            
            if total_tasks > 0:
                progress = int((completed_tasks / total_tasks) * 100)
                
                # Calculate days ahead/behind
                if project.end_date:
                    today = timezone.now().date()
                    days_remaining = (project.end_date - today).days
                    
                    # Estimate completion based on current progress
                    if progress > 0:
                        days_elapsed = (today - project.start_date).days if project.start_date else 0
                        if days_elapsed > 0:
                            rate = progress / days_elapsed
                            estimated_days_needed = (100 - progress) / rate if rate > 0 else days_remaining
                            days_ahead = days_remaining - estimated_days_needed
                            
                            if days_ahead > 0:
                                insights.append({
                                    'project_name': project.title,
                                    'progress': progress,
                                    'days_ahead': int(days_ahead),
                                    'message': f"{project.title} is {progress}% complete — expected to finish {int(days_ahead)} day{'s' if days_ahead > 1 else ''} ahead."
                                })
                            elif days_ahead < -1:
                                insights.append({
                                    'project_name': project.title,
                                    'progress': progress,
                                    'days_behind': int(abs(days_ahead)),
                                    'message': f"{project.title} is {progress}% complete — may finish {int(abs(days_ahead))} day{'s' if abs(days_ahead) > 1 else ''} behind schedule."
                                })
        
        # If no insights, provide default
        if not insights:
            insights.append({
                'project_name': 'General',
                'progress': 0,
                'message': 'No active projects to analyze. Create projects to get AI insights.'
            })
        
        return Response({
            'insights': insights[:3]  # Return top 3 insights
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': f'Error generating AI insights: {str(e)}',
            'insights': [{
                'message': 'Unable to generate insights at this time.'
            }]
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def parse_resume_api(request):
    """Parse resume file and extract employee information"""
    try:
        if 'resume' not in request.FILES:
            return Response(
                {'error': 'No resume file provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        resume_file = request.FILES['resume']
        
        # Save file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(resume_file.name)[1]) as tmp_file:
            for chunk in resume_file.chunks():
                tmp_file.write(chunk)
            tmp_path = tmp_file.name
        
        try:
            # Parse resume
            parsed_data = parse_resume(tmp_path)
            return Response(parsed_data, status=status.HTTP_200_OK)
        finally:
            # Clean up temp file
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)
                
    except Exception as e:
        return Response(
            {'error': f'Error parsing resume: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ai_employee_insights(request):
    """Get AI-powered insights for employees"""
    try:
        insights = EmployeeAIService.get_employee_insights()
        return Response(insights, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {'error': f'Error generating insights: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ai_similar_employees(request, employee_id):
    """Find similar employees using AI"""
    try:
        employee = Employee.objects.get(id=employee_id)
        similar = EmployeeAIService.find_similar_employees(employee)
        return Response(similar, status=status.HTTP_200_OK)
    except Employee.DoesNotExist:
        return Response(
            {'error': 'Employee not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'Error finding similar employees: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ai_team_recommendations(request):
    """Get AI-powered team recommendations"""
    try:
        recommendations = EmployeeAIService.get_team_recommendations()
        return Response(recommendations, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {'error': f'Error generating recommendations: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ai_churn_prediction(request):
    """Predict employee churn using AI"""
    try:
        predictions = EmployeeAIService.predict_churn()
        return Response(predictions, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {'error': f'Error predicting churn: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ai_natural_language_search(request):
    """Natural language search for employees"""
    try:
        query = request.data.get('query', '')
        if not query:
            return Response(
                {'error': 'Query is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        results = EmployeeAIService.natural_language_search(query)
        return Response(results, status=status.HTTP_200_OK)
    except Exception as e:
            return Response(
                {'error': f'Error performing search: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# Dashboard AI Endpoints
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_ai_insights_comprehensive(request):
    """Get comprehensive AI-powered dashboard insights"""
    try:
        from projects.models import Project
        from tasks.models import Task
        from finance.models import Income, Expense
        from invoices.models import Invoice
        
        # Get project data
        projects = Project.objects.all()
        projects_data = {
            'total': projects.count(),
            'in_progress': projects.filter(status='in_progress').count(),
            'completed': projects.filter(status='completed').count(),
            'over_due': projects.filter(end_date__lt=timezone.now().date(), status__in=['in_progress', 'planning']).count()
        }
        
        # Get financial data
        total_revenue = sum([inv.amount for inv in Invoice.objects.filter(status='paid')])
        total_cost = sum([exp.amount for exp in Expense.objects.all()])
        planned_revenue = sum([inv.amount for inv in Invoice.objects.all()])
        
        financial_data = {
            'total_revenue': float(total_revenue),
            'total_cost': float(total_cost),
            'planned_revenue': float(planned_revenue),
            'current_month_revenue': float(sum([inv.amount for inv in Invoice.objects.filter(
                status='paid',
                created_at__month=timezone.now().month,
                created_at__year=timezone.now().year
            )]))
        }
        
        # Get workload data
        employees = Employee.objects.filter(is_active=True)
        employee_task_counts = {}
        for emp in employees:
            employee_task_counts[emp.id] = Task.objects.filter(assigned_to=emp).count()
        
        healthy = sum(1 for count in employee_task_counts.values() if 5 <= count <= 15)
        underutilised = sum(1 for count in employee_task_counts.values() if count < 5)
        overutilised = sum(1 for count in employee_task_counts.values() if count > 15)
        total = healthy + underutilised + overutilised
        
        workload_data = {
            'healthy': round((healthy / total * 100) if total > 0 else 0),
            'underutilised': round((underutilised / total * 100) if total > 0 else 0),
            'overutilised': round((overutilised / total * 100) if total > 0 else 0)
        }
        
        # Generate insights
        insights = DashboardAIService.generate_dashboard_insights(
            projects_data, financial_data, workload_data
        )
        
        return Response({
            'insights': insights,
            'generated_at': timezone.now().isoformat()
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': f'Error generating insights: {str(e)}',
            'insights': []
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_revenue_forecast(request):
    """Get revenue forecast for next N months"""
    try:
        from invoices.models import Invoice
        
        months = int(request.GET.get('months', 3))
        current_revenue = float(sum([inv.amount for inv in Invoice.objects.filter(status='paid')]))
        
        forecast = DashboardAIService.predict_revenue_forecast(current_revenue, months)
        
        return Response(forecast, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': f'Error generating forecast: {str(e)}',
            'forecast': []
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_project_health_scores(request):
    """Get health scores for all projects"""
    try:
        from projects.models import Project
        from tasks.models import Task
        
        projects = Project.objects.all()
        health_scores = []
        
        for project in projects:
            # Get project tasks
            tasks = Task.objects.filter(project=project)
            total_tasks = tasks.count()
            completed_tasks = tasks.filter(status='completed').count()
            
            # Calculate spent (simplified - use actual expense tracking in production)
            from finance.models import Expense
            # Expense model doesn't have project field
            spent = 0.0  # float(sum([exp.amount for exp in Expense.objects.filter(project=project)]))
            
            project_data = {
                'id': project.id,
                'title': project.title,
                'end_date': project.end_date,
                'start_date': project.start_date,
                'budget': float(project.budget),
                'spent': spent,
                'progress': int((completed_tasks / total_tasks * 100) if total_tasks > 0 else 0),
                'total_tasks': total_tasks,
                'completed_tasks': completed_tasks,
                'status': project.status,
                'team_workload': 0.5  # Simplified - calculate actual workload
            }
            
            health = DashboardAIService.calculate_project_health_score(project_data)
            health_scores.append({
                'project_id': project.id,
                'project_name': project.title,
                **health
            })
        
        return Response({
            'health_scores': sorted(health_scores, key=lambda x: x['score']),
            'average_score': sum([h['score'] for h in health_scores]) / len(health_scores) if health_scores else 0
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': f'Error calculating health scores: {str(e)}',
            'health_scores': []
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_anomaly_detection(request):
    """Detect anomalies in projects and financial data"""
    try:
        from projects.models import Project
        from finance.models import Expense
        from invoices.models import Invoice
        
        # Get projects with budget data
        projects = []
        for project in Project.objects.all():
            # Expense model doesn't have project field
            spent = 0.0  # float(sum([exp.amount for exp in Expense.objects.filter(project=project)]))
            projects.append({
                'id': project.id,
                'title': project.title,
                'budget': float(project.budget),
                'spent': spent,
                'end_date': project.end_date,
                'status': project.status
            })
        
        # Get financial data
        total_revenue = float(sum([inv.amount for inv in Invoice.objects.filter(status='paid')]))
        current_month_revenue = float(sum([inv.amount for inv in Invoice.objects.filter(
            status='paid',
            created_at__month=timezone.now().month,
            created_at__year=timezone.now().year
        )]))
        
        financial_data = {
            'total_revenue': total_revenue,
            'current_month_revenue': current_month_revenue
        }
        
        anomalies = DashboardAIService.detect_anomalies(projects, financial_data)
        
        return Response({
            'anomalies': anomalies,
            'count': len(anomalies)
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': f'Error detecting anomalies: {str(e)}',
            'anomalies': []
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_smart_recommendations(request):
    """Get smart recommendations for resource allocation and optimization"""
    try:
        from projects.models import Project
        from tasks.models import Task
        from finance.models import Expense
        from invoices.models import Invoice
        
        # Get projects with health scores
        projects = []
        for project in Project.objects.all():
            tasks = Task.objects.filter(project=project)
            total_tasks = tasks.count()
            completed_tasks = tasks.filter(status='completed').count()
            
            # Expense model doesn't have project field
            spent = 0.0  # float(sum([exp.amount for exp in Expense.objects.filter(project=project)]))
            
            health = DashboardAIService.calculate_project_health_score({
                'id': project.id,
                'title': project.title,
                'end_date': project.end_date,
                'start_date': project.start_date,
                'budget': float(project.budget),
                'spent': spent,
                'progress': int((completed_tasks / total_tasks * 100) if total_tasks > 0 else 0),
                'total_tasks': total_tasks,
                'completed_tasks': completed_tasks,
                'team_workload': 0.5
            })
            projects.append({
                'id': project.id,
                'title': project.title,
                'health_score': health.get('score', 50)
            })
        
        # Get employees with task counts
        employees = []
        for emp in Employee.objects.filter(is_active=True):
            task_count = Task.objects.filter(assigned_to=emp).count()
            employees.append({
                'id': emp.id,
                'name': emp.name,
                'task_count': task_count,
                'department': emp.department.title if emp.department else None,
                'designation': emp.designation.title if emp.designation else None
            })
        
        # Get financial data
        total_revenue = float(sum([inv.amount for inv in Invoice.objects.filter(status='paid')]))
        total_cost = float(sum([exp.amount for exp in Expense.objects.all()]))
        
        financial_data = {
            'total_revenue': total_revenue,
            'total_cost': total_cost
        }
        
        recommendations = DashboardAIService.generate_smart_recommendations(
            projects, employees, financial_data
        )
        
        return Response({
            'recommendations': recommendations,
            'count': len(recommendations)
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': f'Error generating recommendations: {str(e)}',
            'recommendations': []
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_risk_assessment(request):
    """Get risk assessment for projects and employees"""
    try:
        from projects.models import Project
        from tasks.models import Task
        from finance.models import Expense
        
        # Get projects with health data
        projects = []
        for project in Project.objects.all():
            tasks = Task.objects.filter(project=project)
            total_tasks = tasks.count()
            completed_tasks = tasks.filter(status='completed').count()
            
            # Expense model doesn't have project field, so we'll use 0 for now
            # In production, link expenses to projects or use a different calculation
            spent = 0.0  # float(sum([exp.amount for exp in Expense.objects.filter(project=project)]))
            
            # Get assigned team members for this project
            # Get unique employees assigned to tasks in this project
            assigned_employees = []
            assigned_employee_ids = set()
            try:
                for task in tasks.filter(assigned_to__isnull=False):
                    if task.assigned_to and task.assigned_to.id not in assigned_employee_ids:
                        assigned_employee_ids.add(task.assigned_to.id)
                        try:
                            assigned_employees.append({
                                'id': task.assigned_to.id,
                                'name': task.assigned_to.name or 'Unknown',
                                'email': task.assigned_to.user.email if task.assigned_to.user else None,
                                'designation': task.assigned_to.designation if task.assigned_to.designation else None,
                                'department': task.assigned_to.department if task.assigned_to.department else None,
                            })
                        except Exception as e:
                            # Skip this employee if there's an error accessing their data
                            continue
            except Exception as e:
                # If there's an error, just continue with empty list
                assigned_employees = []
            
            # Prepare full project data for risk calculation
            project_data = {
                'id': project.id,
                'title': project.title,
                'end_date': project.end_date,
                'start_date': project.start_date,
                'budget': float(project.budget),
                'spent': spent,
                'progress': int((completed_tasks / total_tasks * 100) if total_tasks > 0 else 0),
                'total_tasks': total_tasks,
                'completed_tasks': completed_tasks,
                'team_workload': 0.5,
                'status': project.status,
                'assigned_team_members': assigned_employees,
            }
            
            projects.append(project_data)
        
        # Get employees with task counts
        employees = []
        for emp in Employee.objects.filter(is_active=True):
            task_count = Task.objects.filter(assigned_to=emp).count()
            # Calculate tenure
            if emp.joining_date:
                tenure_days = (timezone.now().date() - emp.joining_date).days
            else:
                tenure_days = 0
            
            employees.append({
                'id': emp.id,
                'name': emp.name,
                'task_count': task_count,
                'department': emp.department.title if emp.department else None,
                'designation': emp.designation.title if emp.designation else None,
                'is_active': emp.is_active,
                'tenure_days': tenure_days
            })
        
        risk_scores = DashboardAIService.calculate_risk_scores(projects, employees)
        
        return Response(risk_scores, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': f'Error calculating risk scores: {str(e)}',
            'project_risks': [],
            'employee_risks': []
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_trend_predictions(request):
    """Get trend predictions for revenue, projects, and costs"""
    try:
        from invoices.models import Invoice
        from finance.models import Expense
        from projects.models import Project
        
        months = int(request.GET.get('months', 6))
        
        # Get financial data (last 12 months)
        financial_data = []
        for i in range(12):
            month_date = timezone.now() - timedelta(days=30 * i)
            month_revenue = float(sum([inv.amount for inv in Invoice.objects.filter(
                status='paid',
                created_at__month=month_date.month,
                created_at__year=month_date.year
            )]))
            month_cost = float(sum([exp.amount for exp in Expense.objects.filter(
                date__month=month_date.month,
                date__year=month_date.year
            )]))
            financial_data.append({
                'revenue': month_revenue,
                'cost': month_cost
            })
        
        # Get project data
        project_data = []
        for project in Project.objects.all():
            project_data.append({
                'id': project.id,
                'title': project.title,
                'status': project.status
            })
        
        predictions = DashboardAIService.generate_trend_predictions(
            financial_data, project_data, months
        )
        
        return Response(predictions, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': f'Error generating predictions: {str(e)}',
            'revenue_trend': {'forecast': []},
            'project_completions': [],
            'cost_trend': []
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_performance_benchmark(request):
    """Get performance benchmarks comparing current vs historical"""
    try:
        from invoices.models import Invoice
        from projects.models import Project
        
        # Get current data
        current_revenue = float(sum([inv.amount for inv in Invoice.objects.filter(status='paid')]))
        current_completed = Project.objects.filter(status='completed').count()
        
        # Get historical data (last 6 months)
        historical_data = []
        for i in range(6):
            month_date = timezone.now() - timedelta(days=30 * i)
            month_revenue = float(sum([inv.amount for inv in Invoice.objects.filter(
                status='paid',
                created_at__month=month_date.month,
                created_at__year=month_date.year
            )]))
            month_completed = Project.objects.filter(
                status='completed',
                end_date__month=month_date.month,
                end_date__year=month_date.year
            ).count()
            historical_data.append({
                'revenue': month_revenue,
                'completed_projects': month_completed
            })
        
        current_data = {
            'revenue': current_revenue,
            'completed_projects': current_completed
        }
        
        benchmarks = DashboardAIService.benchmark_performance(current_data, historical_data)
        
        return Response(benchmarks, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': f'Error calculating benchmarks: {str(e)}',
            'revenue': {},
            'project_completion': {}
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def dashboard_natural_language_query(request):
    """Process natural language queries for dashboard"""
    try:
        from invoices.models import Invoice
        from projects.models import Project
        from tasks.models import Task
        
        query = request.data.get('query', '')
        if not query:
            return Response({
                'error': 'Query is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Prepare available data
        current_revenue = float(sum([inv.amount for inv in Invoice.objects.filter(status='paid')]))
        
        projects = []
        for project in Project.objects.all():
            tasks = Task.objects.filter(project=project)
            health = DashboardAIService.calculate_project_health_score({
                'id': project.id,
                'title': project.title,
                'end_date': project.end_date,
                'budget': float(project.budget),
                'spent': 0,
                'progress': 0,
                'total_tasks': tasks.count(),
                'completed_tasks': tasks.filter(status='completed').count(),
                'team_workload': 0.5
            })
            projects.append({
                'id': project.id,
                'title': project.title,
                'status': project.status,
                'health_score': health.get('score', 50)
            })
        
        # Get workload data
        employees = Employee.objects.filter(is_active=True)
        employee_task_counts = {}
        for emp in employees:
            employee_task_counts[emp.id] = Task.objects.filter(assigned_to=emp).count()
        
        healthy = sum(1 for count in employee_task_counts.values() if 5 <= count <= 15)
        underutilised = sum(1 for count in employee_task_counts.values() if count < 5)
        overutilised = sum(1 for count in employee_task_counts.values() if count > 15)
        total = healthy + underutilised + overutilised
        
        workload_data = {
            'healthy': round((healthy / total * 100) if total > 0 else 0),
            'underutilised': round((underutilised / total * 100) if total > 0 else 0),
            'overutilised': round((overutilised / total * 100) if total > 0 else 0)
        }
        
        available_data = {
            'current_revenue': current_revenue,
            'projects': projects,
            'workload': workload_data
        }
        
        result = DashboardAIService.process_natural_language_query(query, available_data)
        
        return Response(result, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': f'Error processing query: {str(e)}',
            'query': query,
            'intent': 'error',
            'message': 'Unable to process query'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
