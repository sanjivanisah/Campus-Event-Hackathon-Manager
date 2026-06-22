from django.db import models
from teams.models import Team


class Submission(models.Model):
    team = models.ForeignKey(Team, on_delete=models.CASCADE)
    github_url = models.URLField()
    demo_url = models.URLField(blank=True)
    description = models.TextField()
    submitted_at = models.DateTimeField(auto_now=True)