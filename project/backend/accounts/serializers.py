from rest_framework import serializers
from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'role', 'college']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=validated_data['role'],
            college=validated_data['college'],
        )

        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'college']


class GoogleAuthSerializer(serializers.Serializer):
    """Serializer for Google OAuth token verification"""
    token = serializers.CharField()
    role = serializers.ChoiceField(
        choices=User.ROLE_CHOICES,
        default='PARTICIPANT',
        required=False,
    )
    college = serializers.CharField(
        allow_blank=True,
        required=False,
    )

    def validate_token(self, value):
        if not value:
            raise serializers.ValidationError('Token is required')
        return value
