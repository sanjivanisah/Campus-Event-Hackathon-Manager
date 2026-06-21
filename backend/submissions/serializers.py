from rest_framework import serializers
from django.utils import timezone
from .models import Submission
from teams.models import TeamMember


class SubmissionSerializer(serializers.ModelSerializer):
    team_name = serializers.CharField(source='team.name', read_only=True)
    event_title = serializers.CharField(source='team.event.title', read_only=True)

    class Meta:
        model = Submission
        fields = [
            'id',
            'team',
            'team_name',
            'event_title',
            'github_url',
            'demo_url',
            'description',
            'submitted_at',
        ]
        read_only_fields = ['submitted_at']

    def validate_team(self, team):
        request = self.context['request']

        if team.leader != request.user:
            raise serializers.ValidationError('Only the team leader can submit a project.')

        if not TeamMember.objects.filter(team=team, user=request.user).exists():
            raise serializers.ValidationError('You are not a member of this team.')

        if timezone.now() > team.event.submission_deadline:
            raise serializers.ValidationError('Submission deadline has passed.')

        return team
