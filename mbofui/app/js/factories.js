/*jshint strict:false */
/* global ocellus, leafletize, _*/
ocellus.factory('Bof', ['$http', '$log', '$q', '$rootScope', function($http, $log, $q, $rootScope) {
  return {
    //get user
    GetUser: function(url) {
      return $http.get(url).then(
        function success(result) {
          return result;
        },
        function error(result) {
          // do some error things
        });
    },
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

    // put and edited event
    PutBof: function(url, data) {
      return $http.put(url, data).then(
        function success(result) {
          return result;
        },
        function error(result) {
          // do some error things
        });
    },

    // get an address
    GetAddress: function(url) {
      return $http.get(url).then(
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
              bofs = leafletize(bofs, $rootScope.user);
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
    resolveIcon: function(key){
      return ( {
        'Study/Discussion': {
          type: 'awesomeMarker',
          icon: 'pencil',
          markerColor: 'green'
        },
        'Course/Class': {
          type: 'awesomeMarker',
          icon: 'heart',
          markerColor: 'red'
        },
        'Practice/Rehearsal': {
          type: 'awesomeMarker',
          icon: 'music',
          markerColor: 'orange'
        },
        'Social Gathering': {
          type: 'awesomeMarker',
          icon: 'ice-lolly-tasted',
          markerColor: 'yellow'
        },
        'Business/Networking': {
          type: 'awesomeMarker',
          icon: 'euro',
          markerColor: 'darkred'
        },
        'Public Ceremony': {
          type: 'awesomeMarker',
          icon: 'king',
          markerColor: 'darkgreen'
        },
        'Family': {
          type: 'awesomeMarker',
          icon: 'gift',
          markerColor: 'purple'
        },
        'Sports': {
          type: 'awesomeMarker',
          icon: 'flash',
          markerColor: 'darkpurple'
        },
        'Political/Rally': {
          type: 'awesomeMarker',
          icon: 'bullhorn',
          markerColor: 'cadetblue'
        }
      }[ String( key ) ] || {
        type: 'awesomeMarker',
        icon: 'record',
        markerColor: 'blue'
      } );
    }
  };
}]);
