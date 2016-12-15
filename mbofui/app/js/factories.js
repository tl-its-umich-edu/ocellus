/*jshint strict:false */
/* global ocellus, leafletize, _*/
ocellus.factory('Bof', ['$http', '$log', '$q', '$rootScope', '$window', function($http, $log, $q, $rootScope,$window) {
  return {
    LoggedIn: function(url) {
      return $http.get(url).then(
        function success(result) {
          return result;
        },
        function error(result) {
          if(result.status !==403){
            $rootScope.alert={'type':'alert-danger','message':result.status + ' ' + result.statusText + ' ' + result.config.url};
            $('#alertPanel').show();
          }
          else {
            return result;
          }
        });
    },
    //get user
    GetUser: function(url) {
      return $http.get(url).then(
        function success(result) {
          return result;
        },
        function error(result) {
          if(result.status !==403){
            $rootScope.alert={'type':'alert-danger','message':result.status + ' ' + result.statusText + ' ' + result.config.url};
            $('#alertPanel').show();
          }
          else {
            return result;
          }
        });
    },
    // get intentions for current user
    GetIntentions: function(url) {
      // at some point this will need to be paged

      var intentions = [];
      var deferred = $q.defer();
      var getNext = function(url) {
        $http.get(url)
          .then(function(result) {
            // data shape is different on paged and non-paged responses
            if (result.data.results) {
              intentions = intentions.concat(result.data.results);
            } else {
              intentions = intentions.concat(result.data);
            }
            if (result.data.next) {
              // paged response, get the next page with the provided url at result.data.next
              getNext(result.data.next);
            } else {
              // either last page or single one
              // turn list into an array suitable for leaflet consumption
              // resolve promise now that it is complete
              deferred.resolve(intentions);
            }
          }, function(result) {
            // TODO: deal with errors, probably here
            $rootScope.alert={'type':'alert-danger','message':result.status + ' ' + result.statusText + ' ' + result.config.url};
            $('#alertPanel').show();
            deferred.resolve(result);
          });
      };
      getNext(url);
      return deferred.promise;
    },
    // declare an intention
    IntendPost: function(url, data) {
      return $http.post(url, data).then(
        function success(result) {
          return result;
        },
        function error(result) {
          $rootScope.alert={'type':'alert-danger','message':result.status + ' ' + result.statusText + ' ' + result.config.url};
          $('#alertPanel').show();
      });
    },
    // edt a declared intention
    IntendPut: function(url, data) {
      return $http.put(url, data).then(
        function success(result) {
          return result;
        },
        function error(result) {
          $rootScope.alert={'type':'alert-danger','message':result.status + ' ' + result.statusText + ' ' + result.config.url};
          $('#alertPanel').show();
      });
    },
    // post an event
    PostBof: function(url, data) {
      return $http.post(url, data).then(
        function success(result) {
          return result;
        },
        function error(result) {
          $rootScope.alert={'type':'alert-danger','message':result.status + ' ' + result.statusText + ' ' + result.config.url};
          $('#alertPanel').show();
        });
    },
    // put and edited event
    PutBof: function(url, data) {
      return $http.put(url, data).then(
        function success(result) {
          return result;
        },
        function error(result) {
          $rootScope.alert={'type':'alert-danger','message':result.status + ' ' + result.statusText + ' ' + result.config.url};
          $('#alertPanel').show();
        });
    },
    // get an address
    GetCurrentLocation: function() {
      var deferred = $q.defer();
      if (!$window.navigator.geolocation) {
        deferred.reject('Geolocation not supported.');
      } else {
        $window.navigator.geolocation.getCurrentPosition(
          function (position) {
            deferred.resolve(position);
          },
          function (err) {
            deferred.reject(err);
          });
      }
      return deferred.promise;
    },

    // get an address
    GetAddress: function(url) {
      return $http.get(url).then(
      function success(result) {
        return result;
      },
      function error(result) {
        $rootScope.alert={'type':'alert-danger','message':result.status + ' ' + result.statusText + ' ' + result.config.url};
        $('#alertPanel').show();
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
            $rootScope.alert={'type':'alert-danger','message':result.status + ' ' + result.statusText + ' ' + result.config.url};
            $('#alertPanel').show();
            deferred.resolve(result);
          });
      };
      getNext(url);
      return deferred.promise;
    },
    GetBof: function(url) {
      // at some point this will need to be paged
      return $http.get(url).then(
        function success(result) {
          return result;
        },
        function error(result) {
          $rootScope.alert={'type':'alert-danger','message':result.status + ' ' + result.statusText + ' ' + result.configurl};
          $('#alertPanel').show();
        });
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
