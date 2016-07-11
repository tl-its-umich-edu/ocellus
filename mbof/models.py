from __future__ import unicode_literals

import datetime
import logging
import os

from django.db import models
from django.utils import timezone
from django.utils.encoding import python_2_unicode_compatible

logger = logging.getLogger(__name__)


def currentUserLoginName():
    # FIXME: Would like to do this in save() method, but that causes errors
    return os.getenv('REMOTE_USER')


def currentUserObject():
    # FIXME: Would like to do this in save() method, but that causes errors
    return User.objects.get(loginName=os.getenv('REMOTE_USER'))


@python_2_unicode_compatible
class Role(models.Model):
    code = models.CharField(max_length=8)
    description = models.CharField(max_length=20)

    def __str__(self):
        return str(self.description) + ' (' + self.__class__.__name__ + ': ' + str(self.id) + ')'


@python_2_unicode_compatible
class User(models.Model):
    loginName = models.CharField(max_length=80, primary_key=True)
    displayName = models.CharField(max_length=120)
    surname = models.CharField(max_length=50)
    givenName = models.CharField(max_length=50)
    aboutMe = models.CharField(max_length=2000, null=True)
    roles = models.ForeignKey(Role, null=True)

    @property
    def reputation(self):
        rep = 0
        events = Event.objects.filter(owner=self)
        for e in events:
            votes = Vote.objects.filter(event=e)
            for vote in votes:
                if vote.vote == '+1':
                    rep += 1
                if vote.vote == '-1':
                    rep -= 1
        return rep

    def __str__(self):
        return str(self.loginName) + ' (' + self.__class__.__name__ + ': ' + str(self.loginName) + ')'


@python_2_unicode_compatible
class Event(models.Model):
    title = models.CharField(max_length=50, default='Untitled')
    latitude = models.FloatField()
    longitude = models.FloatField()
    altitudeMeters = models.FloatField()
    eventText = models.CharField(max_length=400)
    category = models.CharField(max_length=40, null=True)
    postingTime = models.DateTimeField(editable=False, blank=True)
    startTime = models.DateTimeField(blank=True, null=True)
    endTime = models.DateTimeField(blank=True, null=True)
    owner = models.ForeignKey(User, default=currentUserLoginName, editable=False)
    participantCount = models.IntegerField(default=0)
    hashtag = models.CharField(max_length=40, null=True)

    @property
    def votes(self):
        voteTotal = reduce(
                lambda sum, vote: sum + (
                    1 if vote.vote == Vote.VOTE_PLUS else (
                        -1 if vote.vote == Vote.VOTE_MINUS else 0)),
                Vote.objects.filter(event=self),
                0
        )
        return voteTotal

    def __str__(self):
        return str(self.eventText) + ' (' + self.__class__.__name__ + ': ' + str(self.id) + ')'

    def save(self, force_insert=False, force_update=False, using=None,
             update_fields=None):
        self.postingTime = timezone.now()

        if self.startTime is None:
            self.startTime = self.postingTime

        if self.endTime is None:
            self.endTime = self.startTime + datetime.timedelta(days=5)

        return super(Event, self).save(force_insert, force_update, using, update_fields)


@python_2_unicode_compatible
class Vote(models.Model):
    VOTE_PLUS = '+1'
    VOTE_MINUS = '-1'
    VOTE_NONE = '0'
    event = models.ForeignKey(Event)
    voter = models.ForeignKey(User, default=currentUserObject, editable=False)
    vote = models.CharField(max_length=2, choices=(
        (VOTE_PLUS, VOTE_PLUS),
        (VOTE_MINUS, VOTE_MINUS),
        (VOTE_NONE, VOTE_NONE),
    ))

    class Meta:
        unique_together = ('event', 'voter',)

    def __str__(self):
        return str(self.voter) + ' voted ' + str(self.vote) + ' on ' + str(
                self.event) + ' (' + self.__class__.__name__ + ': ' + str(self.id) + ')'
