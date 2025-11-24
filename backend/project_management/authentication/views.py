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
