'use strict';
/* global ocellus, leafletize */
ocellus.factory('Bof', function($http, $log, $q) {
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
    }
  };
});
