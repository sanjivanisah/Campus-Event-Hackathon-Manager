from django.db.models import Q
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from accounts.permissions import IsAdmin, IsAdminOrOrganizer
from .models import Event
from .serializers import EventSerializer


class EventListCreateView(generics.ListCreateAPIView):
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        events = Event.objects.select_related(
            'organizer',
            'approved_by',
        ).order_by('registration_deadline')

        if self.request.user.role == 'ADMIN':
            return events

        if self.request.user.role == 'ORGANIZER':
            return events.filter(
                Q(approval_status=Event.APPROVAL_APPROVED)
                | Q(organizer=self.request.user)
            )

        return events.filter(approval_status=Event.APPROVAL_APPROVED)

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminOrOrganizer()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        if self.request.user.role == 'ADMIN':
            serializer.save(
                organizer=self.request.user,
                approval_status=Event.APPROVAL_APPROVED,
                approved_by=self.request.user,
                approved_at=timezone.now(),
            )
        else:
            serializer.save(
                organizer=self.request.user,
                approval_status=Event.APPROVAL_PENDING,
            )


@api_view(['POST'])
@permission_classes([IsAdmin])
def approve_event(request, event_id):
    try:
        event = Event.objects.get(id=event_id)
    except Event.DoesNotExist:
        return Response(
            {'error': 'Event not found'},
            status=status.HTTP_404_NOT_FOUND,
        )

    event.approval_status = Event.APPROVAL_APPROVED
    event.approved_by = request.user
    event.approved_at = timezone.now()
    event.save(update_fields=['approval_status', 'approved_by', 'approved_at'])

    return Response(EventSerializer(event).data)
