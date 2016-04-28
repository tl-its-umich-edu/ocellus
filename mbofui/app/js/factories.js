'use strict';
/* global ocellus, leafletize */
ocellus.factory('Bof', function($http, $log) {
  return {
    PostBof : function(url, data) {
      return $http.post(url, data).then(
          function success(result) {
            return result;
          },
          function error(result) {
            // do some error things
          });
    },
    GetBofs : function(url) {
      return $http.get(url, {
        cache : false
      }).then(
          function success(result) {
            return leafletize(result);
          },
          function error(result) {
            // do some error things
          });
    }
  };
});
