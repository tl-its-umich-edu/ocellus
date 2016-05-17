ocellus.directive('popup', ['$http', '$compile', function($http, $compile) {
    return {
        restrict: 'E',
        scope: {
            event: "="
        },
        templateUrl: '../views/popup.html'
    };
}]);
