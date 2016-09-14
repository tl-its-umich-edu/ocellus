import os
import logging
import datetime

from django.http import HttpResponse, JsonResponse
from django.shortcuts import render, get_object_or_404
from django.utils import timezone
from rest_framework import generics, viewsets
from django.contrib.auth.models import User

from .models import Event, Vote, Intention, User
from .serializers import EventSerializer, VoteSerializer, IntentionSerializer, UserSerializer

logger = logging.getLogger(__name__)


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
        me = self.request.user.__str__()
        method = self.request.META['REQUEST_METHOD']
        url = self.request.META['PATH_INFO']
        # EXAMPLE - dovek : POST /api/events/
        message = '%s : %s %s' % (me, method, url)
        logger.info(message)
        serializer.save(owner=me)


class EventListViewSet(generics.ListCreateAPIView):
    """
    API endpoint that allows users to be viewed or edited.
    """
    serializer_class = EventSerializer

    def get_queryset(self):
        me = self.log_action()

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
                                             status=Event.STATUS_ACTIVE).order_by('postingTime')
        if query_type == 'upcoming':
            logger.debug('Type is upcoming')
            one_week_out = current_time + datetime.timedelta(days=7)
            query_set = Event.objects.filter(startTime__range=[current_time, one_week_out],
                                             status=Event.STATUS_ACTIVE).order_by('postingTime')
        # else:
        #     logger.debug('Type is ELSE')
        #     query_set = Event.objects.all().order_by('postingTime')
        for event in query_set:
            if event.owner == me:
                event.owner = True
            else:
                event.owner = False

        return query_set

    def log_action(self):
        me = self.request.user.__str__()
        method = self.request.META['REQUEST_METHOD']
        url = self.request.META['PATH_INFO']
        # EXAMPLE - dovek : GET /api/events/current/
        message = '%s : %s %s' % (me, method, url)
        logger.info(message)
        return me


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
        me = self.log_action()
        serializer.save(respondent=me)

    def filter_queryset(self, queryset):
        me = self.log_action()
        queryset = Intention.objects.all()
        username = self.request.query_params.get('username', None)
        event = self.request.query_params.get('event', None)
        if username is not None:
            if username == 'self':
                queryset = queryset.filter(respondent=me)
            else:
                queryset = queryset.filter(respondent=username)
        if event is not None:
            queryset = queryset.filter(event_id=event)
        return queryset

    def log_action(self):
        me = self.request.user.__str__()
        method = self.request.META['REQUEST_METHOD']
        url = self.request.META['PATH_INFO']
        # EXAMPLE - qastud : POST /api/intentions/
        # EXAMPLE - qastud : GET /api/intentions/
        # EXAMPLE - qastud : PUT /api/intentions/2/
        message = '%s : %s %s' % (me, method, url)
        logger.info(message)
        return me
