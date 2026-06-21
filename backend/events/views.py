from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import IsAdminOrOrganizer
from .models import Event
from .serializers import EventSerializer


class EventListCreateView(generics.ListCreateAPIView):
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Event.objects.select_related('organizer').order_by('registration_deadline')

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminOrOrganizer()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(organizer=self.request.user)
