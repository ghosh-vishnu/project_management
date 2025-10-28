from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from django.db import transaction
from .models import Department, Designation, Employee
from .serializers import (
    DepartmentSerializer, DesignationSerializer, 
    EmployeeListSerializer, EmployeeDetailSerializer, EmployeeCreateSerializer
)
import random
import string


def generate_random_password(length=8):
    """Generate a random password"""
    characters = string.ascii_letters + string.digits
    return ''.join(random.choice(characters) for _ in range(length))


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def department_list(request):
    """Get list of all departments"""
    departments = Department.objects.all()
    serializer = DepartmentSerializer(departments, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def designation_list(request):
    """Get list of all designations, optionally filtered by department"""
    # Get department_id from query params if provided
    department_id = request.query_params.get('department_id', None)
    
    designations = Designation.objects.all()
    
    if department_id:
        # Get department to match designations
        try:
            department = Department.objects.get(id=department_id)
            department_title = department.title
            
            # Filter designations that contain this department in their description
            designations = Designation.objects.filter(
                description__icontains=department_title
            )
        except Department.DoesNotExist:
            designations = Designation.objects.none()
    
    serializer = DesignationSerializer(designations, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def employee_names_list(request):
    """Get list of employee names for dropdowns"""
    employees = Employee.objects.select_related('user', 'designation').filter(is_active=True)
    data = [{'id': emp.id, 'name': emp.name, 'designation': emp.designation.title if emp.designation else ''} for emp in employees]
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
        
        # Helper function to get first item if list
        def get_value(key, default=''):
            value = key
            if isinstance(key, list):
                return key[0] if key else default
            return key if key else default
        
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
        
        # Get department and designation
        department = None
        dept_id = get_value(data.get('department_id', ''))
        if dept_id:
            try:
                department = Department.objects.get(id=dept_id)
            except (Department.DoesNotExist, ValueError):
                pass
        
        designation = None
        desig_id = get_value(data.get('designation_id', ''))
        if desig_id:
            try:
                designation = Designation.objects.get(id=desig_id)
            except (Designation.DoesNotExist, ValueError):
                pass
        
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
            department=department,
            designation=designation,
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
    
    employees = Employee.objects.select_related('user', 'department', 'designation').all()
    
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
        employee = Employee.objects.select_related('user', 'department', 'designation',
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
        # TODO: Implement update logic
        serializer = EmployeeDetailSerializer(employee, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        employee.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
