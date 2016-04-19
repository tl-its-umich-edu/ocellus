'use strict';
/* global angular*/
(function () {
    var mbofMapLocation = ['$window', function ($window) {
        var template = '<div class="alert alert-info status"><span id="status">&nbsp;</span></div>' +
                '<div id="map"></div>',
            mapContainer = null,
            statusBar = null,
            statusText = null;

        function link(scope, elem, attrs) {
            var statusElem = document.getElementById('status');
            statusBar = angular.element(statusElem.parentNode);
            statusText = angular.element(statusElem);
            mapContainer = angular.element(document.getElementById('map'));

            mapContainer.attr('style', 'height:' + scope.height + '%;width:' + scope.width + '%');

            $window.navigator.geolocation.getCurrentPosition(mapLocation, geoError);

        }

        function mapLocation(pos) {
            statusText.html('Ah - there you are!');
            statusBar.attr('style', 'display:block;');

            var latlng = new google.maps.LatLng(pos.coords.latitude,
                pos.coords.longitude);
            var options = {
                zoom: 18,
                center: latlng,
                mapTypeControl: true,
                mapTypeId: google.maps.MapTypeId.HYBRID
            };

            var map = new google.maps.Map(mapContainer[0], options);

            var marker = new google.maps.Marker({
                position: latlng,
                map: map
            });
        }

        function geoError(error) {
            // either user does not want to share location
            // or there has been an error - send them to the Diag
            mapLocation({
                "coords": {
                    "latitude": 42.277237,
                    "longitude": -83.738202
                }
            })
            if (error.__proto__.PERMISSION_DENIED === 1) {
                statusText.html('Lurker mode');
            } else {
                statusText.html('Failed lookup ' + error.message);
            }
            statusBar.attr('style', 'display:block;');
        }

        return {
            scope: {
                height: '@',
                width: '@'
            },
            link: link,
            template: template
        }

    }];
    mbofuiApp.directive('mbofMap', mbofMapLocation);
}());
