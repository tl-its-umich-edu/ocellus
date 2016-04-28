import os

from django.http import HttpResponse, JsonResponse
from django.shortcuts import render, get_object_or_404
from rest_framework import viewsets

from .models import Event, User, Vote
from .serializers import EventSerializer, UserSerializer, VoteSerializer


def index(request):
    return render(request, 'events/index.html', {
        'latestEventList': Event.objects.order_by('-postingTime'),
    })


def detail(request, eventId):
    event = get_object_or_404(Event, pk=eventId)
    return render(request, 'events/detail.html', {
        'event': event,
    })


def results(request, eventId):
    response = "You're looking at the results of event %s."
    return HttpResponse(response % eventId)


def vote(request, eventId):
    return HttpResponse("You're voting on event %s." % eventId)


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


class VoteViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = Vote.objects.all()
    serializer_class = VoteSerializer
