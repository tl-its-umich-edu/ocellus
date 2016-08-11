/*jshint strict:false */
ocellus.directive('popup', ['$http', '$compile', 'Bof', function($http, $compile, Bof) {
    return {
        restrict: 'E',
        scope: {
          event: '=event'
        },
        templateUrl: '../views/popup.html'
      };
}]);
