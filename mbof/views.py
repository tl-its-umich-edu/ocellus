import os
import logging
import datetime

from django.http import HttpResponse, JsonResponse
from django.shortcuts import render, get_object_or_404
from django.utils import timezone
from rest_framework import generics, viewsets
from django.shortcuts import redirect
from django.contrib import auth
from .models import Event, User, Vote, Intention
from .serializers import EventSerializer, UserSerializer, VoteSerializer, IntentionSerializer

logger = logging.getLogger(__name__)


def logout(request):
    logger.info('User %s logging out.' % request.user.username)
    auth.logout(request)
    return redirect(os.getenv('SHIB_LOGOUT',
            'https://weblogin-test.itcs.umich.edu/cgi-bin/logout?https://dev.ocellus.openshift.dsc.umich.edu/'))


def log_action(request):
    me = request.user.__str__()
    method = request.META['REQUEST_METHOD']
    url = request.META['PATH_INFO']
    # EXAMPLE - dovek : GET /api/events/current/
    message = '%s : %s %s' % (me, method, url)
    logger.info(message)
    

class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows Users to be viewed or edited.
    """
    queryset = User.objects.all().order_by('surname')
    serializer_class = UserSerializer


class CurrentUserViewSet(UserViewSet):
    queryset = User.objects.filter(loginName=os.getenv('REMOTE_USER')).order_by('surname')


class EventViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows Events to be viewed or edited.
    """
    queryset = Event.objects.all().order_by('postingTime')
    serializer_class = EventSerializer

    def perform_create(self, serializer):
        log_action(self.request)
        serializer.save(owner=self.request.user.__str__())


class EventListViewSet(generics.ListCreateAPIView):
    """
    API endpoint that allows users to be viewed or edited.
    """
    serializer_class = EventSerializer

    def get_queryset(self):
        log_action(self.request)

        query_set = self.queryset
        current_time = timezone.now()
        if self.kwargs['type'] is None:
            logger.debug('Type is None')
            query_set = Event.objects.all().order_by('postingTime')
        query_type = self.kwargs['type']
        query_type = query_type.replace('/', '')
        if query_type == 'current':
            logger.debug('Type is current')
            query_set = Event.objects.filter(startTime__lte=current_time, endTime__gte=current_time,
                                             status = Event.STATUS_ACTIVE).order_by('postingTime')
        if query_type == 'upcoming':
            logger.debug('Type is upcoming')
            one_week_out = current_time + datetime.timedelta(days=7)
            query_set = Event.objects.filter(startTime__range=[current_time, one_week_out],
                                             status = Event.STATUS_ACTIVE).order_by('postingTime')
        # else:
        #     return Event.objects.all().order_by('postingTime')

        for event in query_set:
            if event.owner == self.request.user.__str__():
                event.owner = True
            else:
                event.owner = False

        return query_set


class VoteViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows Votes to be viewed or edited.
    """
    queryset = Vote.objects.all()
    serializer_class = VoteSerializer


class IntentionViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows Intentions to be viewed or edited.
    """
    queryset = Intention.objects.all()
    serializer_class = IntentionSerializer

    def perform_create(self, serializer):
        log_action(self.request)
        serializer.save(respondent=self.request.user.__str__())

    def filter_queryset(self, queryset):
        log_action(self.request)
        queryset = Intention.objects.all()
        username = self.request.query_params.get('username', None)
        event = self.request.query_params.get('event', None)
        if username is not None:
            if username == 'self':
                queryset = queryset.filter(respondent=self.request.user.__str__())
            else:
                queryset = queryset.filter(respondent=username)
        if event is not None:
            queryset = queryset.filter(event_id=event)
        return queryset
