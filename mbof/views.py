import os
import datetime

from django.http import HttpResponse, JsonResponse
from django.shortcuts import render, get_object_or_404
from django.utils import timezone
from rest_framework import viewsets

from .models import Event, User, Vote
from .serializers import EventSerializer, UserSerializer, VoteSerializer


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = User.objects.all().order_by('surname')
    serializer_class = UserSerializer


class CurrentUserViewSet(UserViewSet):
    queryset = User.objects.filter(loginName=os.getenv('REMOTE_USER')).order_by('surname')


class EventViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = Event.objects.all().order_by('postingTime')
    serializer_class = EventSerializer
    

class CurrentEventViewSet(EventViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    def get_queryset(self):
        current_time = timezone.now()
        return Event.objects.filter(startTime__lte=current_time, endTime__gte=current_time).order_by('postingTime')


class CurrentEventViewSet(EventViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    def get_queryset(self):
        current_time = timezone.now()
        return Event.objects.filter(startTime__lte=current_time, endTime__gte=current_time).order_by('postingTime')


class UpcomingEventViewSet(EventViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    def get_queryset(self):
        current_time = timezone.now()
        one_week_out = timezone.now() + datetime.timedelta(days=7)
        return Event.objects.filter(startTime__range=[current_time, one_week_out]).order_by('postingTime')


class VoteViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = Vote.objects.all()
    serializer_class = VoteSerializer
