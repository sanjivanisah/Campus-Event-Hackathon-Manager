from django.urls import path
from .views import create_team, join_team, list_teams

urlpatterns = [
    path('', list_teams),
    path('create/', create_team),
    path('<int:team_id>/join/', join_team),
]
