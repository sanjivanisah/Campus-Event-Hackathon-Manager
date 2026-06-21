from django.conf import settings
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.throttling import UserRateThrottle
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User
from .serializers import RegisterSerializer, UserSerializer


class RegistrationRateThrottle(UserRateThrottle):
    scope = 'registration'


def unique_username_from_email(email):
    base_username = email.split('@')[0].replace('.', '_')[:140] or 'google_user'
    username = base_username
    suffix = 1

    while User.objects.filter(username=username).exists():
        username = f'{base_username}_{suffix}'
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


@api_view(['POST'])
def google_login(request):
    credential = request.data.get('credential')

    if not settings.GOOGLE_CLIENT_ID:
        return Response(
            {'detail': 'Google sign-in is not configured on the server.'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    if not credential:
        return Response(
            {'credential': ['This field is required.']},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        payload = id_token.verify_oauth2_token(
            credential,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID,
        )
    except ValueError as e:
        detail = 'Invalid Google credential.'
        if getattr(settings, 'DEBUG', False):
            detail = f"Invalid Google credential: {e}"

        return Response(
            {'detail': detail},
            status=status.HTTP_400_BAD_REQUEST,
        )

    email = payload.get('email')
    if not email or not payload.get('email_verified'):
        return Response(
            {'detail': 'Google account email must be verified.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    defaults = {
        'username': unique_username_from_email(email),
        'first_name': payload.get('given_name', ''),
        'last_name': payload.get('family_name', ''),
        'role': request.data.get('role') or 'PARTICIPANT',
        'college': request.data.get('college', ''),
    }
    user, created = User.objects.get_or_create(email=email, defaults=defaults)

    if created:
        user.set_unusable_password()
        user.save(update_fields=['password'])
    else:
        update_fields = []
        for field, value in {
            'first_name': payload.get('given_name', ''),
            'last_name': payload.get('family_name', ''),
        }.items():
            if value and getattr(user, field) != value:
                setattr(user, field, value)
                update_fields.append(field)

        if update_fields:
            user.save(update_fields=update_fields)

    refresh = RefreshToken.for_user(user)

    return Response({
        'refresh': str(refresh),
        'access': str(refresh.access_token),
        'user': UserSerializer(user).data,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    return Response(UserSerializer(request.user).data)
