from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Submission
from .serializers import SubmissionSerializer


class SubmissionCreateView(generics.ListCreateAPIView):
    serializer_class = SubmissionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        submissions = Submission.objects.select_related('team', 'team__event')

        if self.request.user.role in ('ADMIN', 'ORGANIZER'):
            return submissions.order_by('-submitted_at')

        return submissions.filter(team__teammember__user=self.request.user).order_by('-submitted_at')

    def perform_create(self, serializer):
        serializer.save()
