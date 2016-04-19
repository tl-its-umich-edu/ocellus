'use strict';
/* global mbofuiApp */
mbofuiApp.factory('Bof', function($http, $log) {
  return {
    PostBof : function(url, data) {
      return $http.post(url, data).then(
          function success(result) {
            // we will get a response;
            // what to do with it
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
            // we will get a response;
            // what to do with it
            return result;
          },
          function error(result) {
            // do some error things
          });
    }


  };
});