from rest_framework import serializers
from django.utils import timezone
from .models import Event


class EventSerializer(serializers.ModelSerializer):
    organizer_name = serializers.CharField(
        source='organizer.username',
        read_only=True,
    )
    team_count = serializers.SerializerMethodField()
    submission_count = serializers.SerializerMethodField()
    registration_open = serializers.SerializerMethodField()
    submission_open = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            'id',
            'organizer',
            'organizer_name',
            'title',
            'description',
            'registration_deadline',
            'submission_deadline',
            'max_team_size',
            'team_count',
            'submission_count',
            'registration_open',
            'submission_open',
        ]
        read_only_fields = ['organizer']

    def get_team_count(self, obj):
        return obj.team_set.count()

    def get_submission_count(self, obj):
        return obj.team_set.filter(submission__isnull=False).count()

    def get_registration_open(self, obj):
        return timezone.now() <= obj.registration_deadline

    def get_submission_open(self, obj):
        return timezone.now() <= obj.submission_deadline
