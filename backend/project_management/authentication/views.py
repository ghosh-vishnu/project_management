from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from .serializers import UserLoginSerializer
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny

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
    first_name = request.data.get('first_name', '')
    last_name = request.data.get('last_name', '')
    
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
    
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name
    )
    
    token, created = Token.objects.get_or_create(user=user)
    
    return Response({
        'accesToken': token.key,
        'user_id': user.id,
        'username': user.username,
        'email': user.email,
        'message': 'User registered successfully'
    }, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password_view(request):
    """
    User password reset endpoint
    """
    # Get authentication token from header
    auth_header = request.headers.get('Authorization')
    
    if not auth_header or not auth_header.startswith('Token '):
        # Fallback: allow user_id in request body for development
        user_id = request.data.get('user_id')
        if not user_id:
            return Response(
                {"error": "Authentication required"},
                status=status.HTTP_401_UNAUTHORIZED
            )
    else:
        # Extract token and get user
        token_key = auth_header.split(' ')[1]
        try:
            from rest_framework.authtoken.models import Token
            token = Token.objects.get(key=token_key)
            user_id = token.user.id
        except Token.DoesNotExist:
            return Response(
                {"error": "Invalid authentication token"},
                status=status.HTTP_401_UNAUTHORIZED
            )
    
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')
    
    if not old_password or not new_password:
        return Response(
            {"error": "Old password and new password are required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if len(new_password) < 6:
        return Response(
            {"error": "New password must be at least 6 characters long"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        user = User.objects.get(id=user_id)
        
        # Verify old password
        if not user.check_password(old_password):
            return Response(
                {"error": "Old password is incorrect"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Set new password
        user.set_password(new_password)
        user.save()
        
        return Response({
            'message': 'Password has been reset successfully'
        }, status=status.HTTP_200_OK)
        
    except User.DoesNotExist:
        return Response(
            {"error": "User not found"},
            status=status.HTTP_404_NOT_FOUND
        )