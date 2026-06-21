from django.db import IntegrityError, transaction
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from accounts.permissions import IsParticipant
from .models import Team, TeamMember
from .serializers import TeamSerializer
from events.models import Event


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_teams(request):
    teams = Team.objects.select_related('event', 'leader').prefetch_related('teammember_set')

    if request.user.role == 'PARTICIPANT':
        teams = teams.filter(teammember__user=request.user)

    return Response(TeamSerializer(teams.order_by('event__registration_deadline'), many=True).data)


@api_view(['POST'])
@permission_classes([IsParticipant])
def create_team(request):
    event_id = request.data.get('event')
    name = request.data.get('name')

    if not event_id or not name:
        return Response(
            {'error': 'Event and team name are required'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        event = Event.objects.get(id=event_id)
    except Event.DoesNotExist:
        return Response(
            {'error': 'Event not found'},
            status=status.HTTP_404_NOT_FOUND,
        )

    if timezone.now() > event.registration_deadline:
        return Response(
            {'error': 'Registration deadline has passed'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    exists = TeamMember.objects.filter(
        user=request.user,
        team__event=event
    ).exists()

    if exists:
        return Response(
            {'error': 'Already in team'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        with transaction.atomic():
            team = Team.objects.create(
                event=event,
                name=name,
                leader=request.user
            )

            TeamMember.objects.create(
                team=team,
                user=request.user
            )
    except IntegrityError:
        return Response(
            {'error': 'A team with this name already exists for the event'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    serializer = TeamSerializer(team)

    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsParticipant])
def join_team(request, team_id):
    try:
        team = Team.objects.select_related('event').get(id=team_id)
    except Team.DoesNotExist:
        return Response({'error': 'Team not found'}, status=status.HTTP_404_NOT_FOUND)

    if timezone.now() > team.event.registration_deadline:
        return Response(
            {'error': 'Registration deadline has passed'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if TeamMember.objects.filter(user=request.user, team__event=team.event).exists():
        return Response(
            {'error': 'You are already in a team for this event'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if TeamMember.objects.filter(team=team).count() >= team.event.max_team_size:
        return Response(
            {'error': 'Team is already full'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    TeamMember.objects.create(team=team, user=request.user)
    return Response(TeamSerializer(team).data)
