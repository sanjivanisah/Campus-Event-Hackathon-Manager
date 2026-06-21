from django.urls import path
from .views import google_login, me, register

urlpatterns = [
    path('register/', register),
    path('google/', google_login),
    path('me/', me),
]
