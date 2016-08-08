/*jshint strict:false */
ocellus.directive('popup', ['$http', '$compile', 'Bof', function($http, $compile, Bof) {
    return {
        restrict: 'E',
        //replace: true,
        //transclude: true,
        controller: 'mapController',
        scope: {
          event: '=event',
          intend: '&'
        },
        templateUrl: '../views/popup.html'
    };
}]);
