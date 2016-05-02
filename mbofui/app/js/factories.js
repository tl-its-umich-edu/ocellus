'use strict';
/* global ocellus, leafletize, _*/
ocellus.factory('Bof', function($http, $log) {
  return {
    // post an event
    PostBof : function(url, data) {
      return $http.post(url, data).then(
          function success(result) {
            return result;
          },
          function error(result) {
            // do some error things
          });
    },
    // get events
    // TODO: at this point it is all - we will need to use this factory
    // to get current and upcoming
    GetBofs : function(url) {
      return $http.get(url, {
        cache : false
      }).then(
          function success(result) {
            // use util function to transform the result for leaflet
            return leafletize(result);
          },
          function error(result) {
            // do some error things
          });
    }
  };
});

ocellus.factory('resolveCategory', ['$rootScope', function($rootScope) {
   var category = {};
   return function(key) {
     var category = _.findWhere($rootScope.event_categories, {'key':key});
     return category;
   };
 }]);

 ocellus.factory('resolveIcon', ['$rootScope', function($rootScope) {
    var icon = {};
    return function(key) {
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
    };
  }]);
