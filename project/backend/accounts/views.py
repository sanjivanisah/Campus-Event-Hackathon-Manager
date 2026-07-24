from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.throttling import UserRateThrottle
from rest_framework_simplejwt.tokens import RefreshToken
from google.auth.transport import requests
from google.oauth2 import id_token
import os
from .serializers import RegisterSerializer, UserSerializer, GoogleAuthSerializer
from .models import User


class RegistrationRateThrottle(UserRateThrottle):
    scope = 'registration'


def unique_username_from_email(email):
    base_username = email.split('@')[0]
    username = base_username
    suffix = 1

    while User.objects.filter(username=username).exists():
        username = f'{base_username}{suffix}'
        suffix += 1

    return username


@api_view(['POST'])
@throttle_classes([RegistrationRateThrottle])
def register(request):
    serializer = RegisterSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    return Response(UserSerializer(request.user).data)


@api_view(['POST'])
@throttle_classes([RegistrationRateThrottle])
def google_auth(request):
    """
    Handle Google OAuth authentication.
    Expects a POST request with a 'token' field containing the Google ID token.
    """
    serializer = GoogleAuthSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    token = serializer.validated_data['token']
    role = serializer.validated_data.get('role', 'PARTICIPANT')
    college = serializer.validated_data.get('college', '')
    google_client_id = os.getenv('GOOGLE_CLIENT_ID')
    
    if not google_client_id:
        return Response(
            {'error': 'Google authentication not configured'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    try:
        # Verify the token with Google
        idinfo = id_token.verify_oauth2_token(
            token,
            requests.Request(),
            google_client_id
        )
        
        # Extract user information
        google_id = idinfo['sub']
        email = idinfo['email']
        first_name = idinfo.get('given_name', '')
        last_name = idinfo.get('family_name', '')
        
        user = User.objects.filter(google_id=google_id).first()

        if user is None:
            user = User.objects.filter(email=email).first()

        if user is None:
            user = User.objects.create_user(
                username=unique_username_from_email(email),
                email=email,
                password=None,
                role=role,
                college=college,
                first_name=first_name,
                last_name=last_name,
                google_id=google_id,
            )
        else:
            user.email = email
            user.first_name = first_name
            user.last_name = last_name
            user.google_id = google_id
            user.role = role

            if college:
                user.college = college

            user.save()
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)
        
    except ValueError:
        # Token is invalid
        return Response(
            {'error': 'Invalid token'},
            status=status.HTTP_401_UNAUTHORIZED
        )
