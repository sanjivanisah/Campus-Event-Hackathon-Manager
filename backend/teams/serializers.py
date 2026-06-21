from rest_framework import serializers
from .models import Team, TeamMember


class TeamSerializer(serializers.ModelSerializer):
    event_title = serializers.CharField(source='event.title', read_only=True)
    leader_name = serializers.CharField(source='leader.username', read_only=True)
    member_count = serializers.SerializerMethodField()

    class Meta:
        model = Team
        fields = [
            'id',
            'event',
            'event_title',
            'name',
            'leader',
            'leader_name',
            'member_count',
        ]
        read_only_fields = ['leader']

    def get_member_count(self, obj):
        return obj.teammember_set.count()


class TeamMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamMember
        fields = '__all__'
