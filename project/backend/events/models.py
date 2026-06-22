from django.db import models
from accounts.models import User


class Event(models.Model):
    organizer = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField()
    registration_deadline = models.DateTimeField()
    submission_deadline = models.DateTimeField()
    max_team_size = models.IntegerField(default=4)

    def __str__(self):
        return self.title