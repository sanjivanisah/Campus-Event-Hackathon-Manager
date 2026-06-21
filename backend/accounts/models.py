from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = (
        ('ADMIN', 'Admin'),
        ('ORGANIZER', 'Organizer'),
        ('PARTICIPANT', 'Participant'),
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='PARTICIPANT',
    )
    college = models.CharField(max_length=255, blank=True)
