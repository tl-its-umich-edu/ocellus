import logging

from rest_framework import serializers

from .models import Event, User, Vote, Intention

logger = logging.getLogger(__name__)


class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        # FIXME: problem with 'roles' in 'fields'
        fields = ('url', 'loginName', 'displayName', 'aboutMe', 'reputation',)


class EventSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Event
        fields = ('url', 'title', 'status', 'address', 'eventText', 'latitude', 'longitude', 'altitudeMeters', 'owner', 'postingTime', 'startTime',
                  'endTime', 'hashtag', 'votes', 'guests', 'category',)


class VoteSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Vote
        fields = ('vote', 'voter', 'event',)


class IntentionSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Intention
        fields = ('url', 'intention', 'respondent', 'event',)
