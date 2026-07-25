from django.urls import path
from .views import EventListCreateView, approve_event

urlpatterns = [
    path('', EventListCreateView.as_view()),
    path('<int:event_id>/approve/', approve_event),
]
