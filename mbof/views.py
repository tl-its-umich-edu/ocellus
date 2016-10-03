import os
import logging
import datetime

from django.http import HttpResponse, JsonResponse
from django.shortcuts import render, get_object_or_404
from django.utils import timezone
from rest_framework import generics, viewsets
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import redirect
from django.contrib import auth
from .models import Event, User, Vote, Intention
from .serializers import EventSerializer, UserSerializer, VoteSerializer, IntentionSerializer
from rest_framework import viewsets, mixins

logger = logging.getLogger(__name__)


def logout(request):
    logger.info('User %s logging out.' % request.user.username)
    auth.logout(request)
    return redirect(os.getenv('SHIB_LOGOUT',
            'https://weblogin-test.itcs.umich.edu/cgi-bin/logout?https://dev.ocellus.openshift.dsc.umich.edu/'))


def log_action(request):
    current_time = timezone.now()
    me = request.user.username
    method = request.META['REQUEST_METHOD']
    url = request.META['PATH_INFO']
    # EXAMPLE - dovek : GET /api/events/current/
    message = '%s - %s - %s %s' % (current_time, me, method, url)
    logger.info(message)


class OcellusViewSet(mixins.CreateModelMixin,
                     mixins.RetrieveModelMixin,
                     mixins.UpdateModelMixin,
                     mixins.ListModelMixin,
                     viewsets.GenericViewSet):

    """
    A viewset that provides default `create()`, `retrieve()`, `update()`,
    `partial_update()`, and `list()` actions.

    Removed destroy() so that DELETE api calls would be excluded.
    """
    pass


class UserViewSet(OcellusViewSet):
    """
    API endpoint that allows Users to be viewed or edited.
    """
    queryset = User.objects.all().order_by('surname')
    serializer_class = UserSerializer


class CurrentUserViewSet(UserViewSet):
    queryset = User.objects.filter(loginName=os.getenv('REMOTE_USER')).order_by('surname')


class EventViewSet(OcellusViewSet):
    """
    API endpoint that allows Events to be viewed or edited.
    """
    queryset = Event.objects.all().order_by('postingTime')
    serializer_class = EventSerializer

    def retrieve(self, request, *args, **kwargs):
        log_action(request)
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        serializer_data = serializer.data
        if serializer_data['owner'] == self.request.user.username:
            serializer_data['owner'] = "True"
        else:
            serializer_data['owner'] = "False"
        return Response(serializer_data)

    def perform_create(self, serializer):
        log_action(self.request)
        serializer.save(owner=self.request.user.username)

    def perform_update(self, serializer):
        log_action(self.request)
        queryset = Event.objects.filter(owner=self.request.user, id=self.kwargs['pk'])
        if not queryset.exists():
            raise PermissionDenied("You do not have permission to edit")
        serializer.save()

    def get_queryset(self):
        log_action(self.request)
        query_set = Event.objects.all().order_by('postingTime')
        for event in query_set:
            if event.owner == self.request.user.username:
                event.owner = True
            else:
                event.owner = False
        return query_set


class EventListViewSet(generics.ListAPIView):
    """
    API endpoint that allows users to be viewed or edited.
    """
    serializer_class = EventSerializer

    def get_queryset(self):
        log_action(self.request)
        query_set = self.queryset
        current_time = timezone.now()
        if self.kwargs['type'] is None:
            query_set = Event.objects.all().order_by('postingTime')
        query_type = self.kwargs['type']
        query_type = query_type.replace('/', '')
        if query_type == 'current':
            query_set = Event.objects.filter(startTime__lte=current_time, endTime__gte=current_time,
                                             status=Event.STATUS_ACTIVE).order_by('postingTime')
        if query_type == 'upcoming':
            one_week_out = current_time + datetime.timedelta(days=7)
            query_set = Event.objects.filter(startTime__range=[current_time, one_week_out],
                                             status=Event.STATUS_ACTIVE).order_by('postingTime')
        # else:
        #     return Event.objects.all().order_by('postingTime')

        for event in query_set:
            if event.owner == self.request.user.username:
                event.owner = True
            else:
                event.owner = False

        return query_set


class VoteViewSet(OcellusViewSet):
    """
    API endpoint that allows Votes to be viewed or edited.
    """
    queryset = Vote.objects.all()
    serializer_class = VoteSerializer


class IntentionViewSet(OcellusViewSet):
    """
    API endpoint that allows Intentions to be viewed or edited.
    """
    queryset = Intention.objects.all()
    serializer_class = IntentionSerializer

    def retrieve(self, request, *args, **kwargs):
        log_action(request)
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        serializer_data = serializer.data
        if serializer_data['respondent'] == self.request.user.username:
            serializer_data['respondent'] = "True"
        else:
            serializer_data['respondent'] = "False"
        return Response(serializer_data)

    def perform_create(self, serializer):
        log_action(self.request)
        serializer.save(respondent=self.request.user.username)

    def perform_update(self, serializer):
        log_action(self.request)
        queryset = Intention.objects.filter(respondent=self.request.user, id=self.kwargs['pk'])
        if not queryset.exists():
            raise PermissionDenied("You do not have permission to edit")
        serializer.save()

    def get_queryset(self):
        log_action(self.request)
        query_set = Intention.objects.all()
        for intention in query_set:
            if intention.respondent == self.request.user.username:
                intention.respondent = True
            else:
                intention.respondent = False
        return query_set

    def filter_queryset(self, queryset):
        log_action(self.request)
        queryset = Intention.objects.all()
        username = self.request.query_params.get('username', None)
        event = self.request.query_params.get('event', None)
        if username is not None:
            if username == 'self':
                queryset = queryset.filter(respondent=self.request.user.username)
            else:
                queryset = queryset.filter(respondent=username)
        if event is not None:
            queryset = queryset.filter(event_id=event)

        for intention in queryset:
            if intention.respondent == self.request.user.username:
                intention.respondent = True
            else:
                intention.respondent = False

        return queryset
