from rest_framework.permissions import BasePermission


class IsAdminOrOrganizer(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in ('ADMIN', 'ORGANIZER')
        )


class IsParticipant(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'PARTICIPANT'
        )
