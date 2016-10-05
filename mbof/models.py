from __future__ import unicode_literals

import datetime
import logging
import os

from django.db import models
from django.utils import timezone
from django.utils.encoding import python_2_unicode_compatible

logger = logging.getLogger(__name__)


@python_2_unicode_compatible
class Role(models.Model):
    code = models.CharField(max_length=8)
    description = models.CharField(max_length=20)

    def __str__(self):
        return str(self.description) + ' (' + self.__class__.__name__ + ': ' + str(self.id) + ')'


@python_2_unicode_compatible
class Event(models.Model):
    STATUS_ACTIVE = 'active'
    STATUS_CANCELED = 'canceled'
    title = models.CharField(max_length=50, default='Untitled')
    address = models.CharField(max_length=500, default='Undefined')
    status = models.CharField(max_length=8, default=STATUS_ACTIVE, choices=(
        (STATUS_ACTIVE, STATUS_ACTIVE),
        (STATUS_CANCELED, STATUS_CANCELED)
    ))
    latitude = models.FloatField()
    longitude = models.FloatField()
    altitudeMeters = models.FloatField()
    eventText = models.CharField(max_length=400)
    category = models.CharField(max_length=40, null=True)
    postingTime = models.DateTimeField(editable=False, blank=True)
    startTime = models.DateTimeField(blank=True, null=True)
    endTime = models.DateTimeField(blank=True, null=True)
    owner = models.CharField(max_length=8, editable=False, db_column='owner')
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

    @property
    def guests(self):
        guestTotal = reduce(
                lambda sum, intention: sum + (
                    1 if intention.intention == Intention.INTENTION_GOING or
                    intention.intention == Intention.INTENTION_MAYBE else 0),
                Intention.objects.filter(event=self),
                0
        )
        return guestTotal

    @property
    def definitely(self):
        guestTotal = reduce(
                lambda sum, intention: sum + (
                    1 if intention.intention == Intention.INTENTION_GOING else 0),
                Intention.objects.filter(event=self),
                0
        )
        return guestTotal

    @property
    def maybe(self):
        guestTotal = reduce(
                lambda sum, intention: sum + (
                    1 if intention.intention == Intention.INTENTION_MAYBE else 0),
                Intention.objects.filter(event=self),
                0
        )
        return guestTotal

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
    voter = models.CharField(max_length=8, editable=False, db_column='voter')
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


@python_2_unicode_compatible
class Intention(models.Model):
    INTENTION_GOING = 'going'
    INTENTION_MAYBE = 'maybe'
    INTENTION_DECLINED = 'declined'
    event = models.ForeignKey(Event)
    respondent = models.CharField(max_length=8, editable=False, db_column='respondent')
    intention = models.CharField(max_length=10, choices=(
        (INTENTION_GOING, INTENTION_GOING),
        (INTENTION_MAYBE, INTENTION_MAYBE),
        (INTENTION_DECLINED, INTENTION_DECLINED),
    ))

    class Meta:
        unique_together = ('event', 'respondent',)

    def __str__(self):
        return str(self.respondent) + ' responded ' + str(self.intention) + ' on ' + str(
                self.event) + ' (' + self.__class__.__name__ + ': ' + str(self.id) + ')'

    def save(self, force_insert=False, force_update=False, using=None,
             update_fields=None):

        return super(Intention, self).save(force_insert, force_update, using, update_fields)
