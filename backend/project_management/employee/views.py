from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from django.db import transaction
from .models import Employee
from .serializers import (
    EmployeeListSerializer, EmployeeDetailSerializer, EmployeeCreateSerializer
)
import random
import string


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
    employees = Employee.objects.select_related('user').filter(is_active=True)
    data = [{'id': emp.id, 'name': emp.name, 'designation': emp.designation if emp.designation else ''} for emp in employees]
    return Response(data)


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
        
        from .models import Address, BankDetails, Documents
        
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
            documents_data = {}
            for key, file in request.FILES.items():
                if key.startswith('documents.'):
                    field_name = key.replace('documents.', '')
                    documents_data[field_name] = file
            
            if documents_data:
                documents = Documents.objects.create(**documents_data)
        
        # Get department and designation as strings
        department_name = get_value(data.get('department_id', ''))
        designation_name = get_value(data.get('designation_id', ''))
        
        # Map IDs to names if needed (for backward compatibility with hardcoded data)
        # Frontend sends department_id and designation_id as indexes
        # We need to get the actual names from the hardcoded lists
        
        # Department mapping
        department_mapping = {
            '1': 'Project Management', '2': 'Development', '3': 'Design',
            '4': 'Quality Assurance', '5': 'Human Resources', '6': 'Sales & Marketing',
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
        
        # Return created employee data
        serializer = EmployeeDetailSerializer(employee)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def employee_list(request):
    """Get paginated list of employees"""
    from django.core.paginator import Paginator
    
    page = int(request.GET.get('page', 1))
    page_size = int(request.GET.get('page_size', 25))
    show_inactive = request.GET.get('show_inactive', 'false').lower() == 'true'
    
    # Filter based on show_inactive parameter
    if show_inactive:
        # Show all employees including inactive ones
        employees = Employee.objects.select_related('user', 'department', 'designation').all()
    else:
        # Show only active employees by default
        employees = Employee.objects.select_related('user', 'department', 'designation').filter(is_active=True)
    
    paginator = Paginator(employees, page_size)
    page_obj = paginator.get_page(page)
    
    serializer = EmployeeListSerializer(page_obj, many=True)
    
    return Response({
        'count': paginator.count,
        'next': page_obj.has_next() if page_obj.has_next() else None,
        'previous': page_obj.has_previous() if page_obj.has_previous() else None,
        'results': serializer.data
    })


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def employee_detail(request, pk):
    """Get, update or delete a specific employee"""
    try:
        employee = Employee.objects.select_related('user',
                                                    'current_address', 'permanent_address',
                                                    'bank_details', 'documents').get(pk=pk)
    except Employee.DoesNotExist:
        return Response(
            {'error': 'Employee not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if request.method == 'GET':
        serializer = EmployeeDetailSerializer(employee, context={'request': request})
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        # Parse nested FormData structure similar to create
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
        
        # Handle department and designation as strings
        if 'department_id' in data:
            department_mapping = {
                '1': 'Project Management', '2': 'Development', '3': 'Design',
                '4': 'Quality Assurance', '5': 'Human Resources', '6': 'Sales & Marketing',
                '7': 'Finance & Accounts', '8': 'Support & Operations', 
                '9': 'IT Infrastructure', '10': 'Research & Innovation'
            }
            dept_id = str(get_value(data.get('department_id', '')))
            data['department'] = department_mapping.get(dept_id, dept_id)
            
        if 'designation_id' in data and 'department' in data:
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
            dept_name = data.get('department', '')
            desig_id = str(get_value(data.get('designation_id', '')))
            if dept_name in designation_mapping:
                desig_map = designation_mapping[dept_name]
                data['designation'] = desig_map.get(desig_id, desig_id)
        
        # Use the parsed data for serialization
        serializer = EmployeeDetailSerializer(employee, data=data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        # Soft delete: deactivate employee and linked user, revoke tokens
        try:
            # Deactivate employee record
            if hasattr(employee, 'is_active'):
                employee.is_active = False
                employee.save(update_fields=['is_active'])

            # Deactivate associated user and remove auth tokens
            if employee.user:
                employee.user.is_active = False
                employee.user.save(update_fields=['is_active'])
                try:
                    from rest_framework.authtoken.models import Token
                    Token.objects.filter(user=employee.user).delete()
                except Exception:
                    # Token model might not be configured; ignore silently
                    pass

            return Response({
                'detail': 'Employee deactivated successfully'
            }, status=status.HTTP_200_OK)
        except Exception as exc:
            return Response({
                'error': f'Failed to deactivate employee: {exc}'
            }, status=status.HTTP_400_BAD_REQUEST)
