from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),

    path('api/token/', TokenObtainPairView.as_view()),
    path('api/token/refresh/', TokenRefreshView.as_view()),

    path('api/accounts/', include('accounts.urls')),
    path('api/events/', include('events.urls')),
    path('api/teams/', include('teams.urls')),
    path('api/submissions/', include('submissions.urls')),
]