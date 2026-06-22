from django.urls import path
from .views import me, register, google_auth

urlpatterns = [
    path('register/', register),
    path('me/', me),
    path('google-auth/', google_auth),
]
