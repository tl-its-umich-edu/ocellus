/*jshint strict:false */
ocellus.directive('popup', ['$http', '$compile', 'Bof', function($http, $compile, Bof) {
    return {
        restrict: 'E',
        //replace: true,
        //transclude: true,
        scope: {
          event: '=event',
          intend: "&"
        },
        templateUrl: '../views/popup.html',
        link: function (scope) {
          scope.intend = function (intent, eventUrl) {
            var eventId = _.last(_.compact(eventUrl.split('/')));
            data = {
                "intention": intent,
                "event": eventId
            };
            console.log(data);
            // use a factory to post new or edited intent
         };
       }
    };
}]);
