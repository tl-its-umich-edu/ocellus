'use strict';
/* global ocellus, leafletize, _*/
ocellus.factory('Bof', function($http, $log, $q, $rootScope) {
  return {
    // post an event
    PostBof: function(url, data) {
      return $http.post(url, data).then(
        function success(result) {
          return result;
        },
        function error(result) {
          // do some error things
        });
    },
    // get events (current, upcoming will depend on url)
    GetBofs: function(url) {
      var bofs = [];
      var deferred = $q.defer();
      var getNext = function(url) {
        $http.get(url)
          .then(function(result) {
            // data shape is different on paged and non-paged responses
            if (result.data.results) {
              bofs = bofs.concat(result.data.results);
            } else {
              bofs = bofs.concat(result.data);
            }
            if (result.data.next) {
              // paged response, get the next page with the provided url at result.data.next
              getNext(result.data.next);
            } else {
              // either last page or single one
              // turn list into an array suitable for leaflet consumption
              bofs = leafletize(bofs);
              // resolve promise now that it is complete
              deferred.resolve(bofs);
            }
          }, function(result) {
            // TODO: deal with errors, probably here
            deferred.resolve(result);
          });
      };
      getNext(url);
      return deferred.promise;
    },
    resolveCategory: function(key){
      var category = _.findWhere($rootScope.event_categories, {'key':key});
      return category;
    },
    resolveIcon: function(key){
      return ( {
        'study_discussion': {
          type: 'awesomeMarker',
          icon: 'pencil',
          markerColor: 'green'
        },
        'course_class': {
          type: 'awesomeMarker',
          icon: 'heart',
          markerColor: 'red'
        },
        'practice_rehearsal': {
          type: 'awesomeMarker',
          icon: 'music',
          markerColor: 'orange'
        },
        'social_gathering': {
          type: 'awesomeMarker',
          icon: 'ice-lolly-tasted',
          markerColor: 'yellow'
        },
        'business_networking': {
          type: 'awesomeMarker',
          icon: 'euro',
          markerColor: 'darkred'
        },
        'public_ceremony': {
          type: 'awesomeMarker',
          icon: 'king',
          markerColor: 'darkgreen'
        },
        'family': {
          type: 'awesomeMarker',
          icon: 'gift',
          markerColor: 'purple'
        },
        'sports': {
          type: 'awesomeMarker',
          icon: 'flash',
          markerColor: 'darkpurple'
        },
        'political_rally': {
          type: 'awesomeMarker',
          icon: 'bullhorn',
          markerColor: 'cadetblue'
        }
      }[ String( key ).toLowerCase() ] || {
        type: 'awesomeMarker',
        icon: 'record',
        markerColor: 'blue'
      } );
    }
  };
});
