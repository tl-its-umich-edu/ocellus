/*jshint strict:false */
/* global angular */

var ocellus = angular.module( 'ocellus', [ 'ui-leaflet', 'ocellusFilters'] );

ocellus.config(['$locationProvider', '$httpProvider', function($locationProvider, $httpProvider) {
  $locationProvider.html5Mode({
    enabled: true,
    requireBase: false
  });
  $httpProvider.defaults.xsrfCookieName = 'csrftoken';
  $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
}]);

ocellus.run(function($rootScope, $window) {
    $rootScope.server = '';
    $rootScope.currentView="Current";
    $rootScope.user = {};
    $rootScope.currentMapKey='AIzaSyBJfRs5m2aIl3cKjMy0es9Fh6-EJeXpP4k';
    $rootScope.currentMapAPI = 'google';
    $rootScope.event_categories = ['Course/Class','Practice/Rehearsal','Social Gathering','Business/Networking','Public Ceremony','Family','Sports','Political/Rally'];
    $rootScope.urls = {
      'intentions':'/api/intentions/'
    };

    $rootScope.online = navigator.onLine;
      $window.addEventListener("offline", function() {
        $rootScope.$apply(function() {
          $rootScope.online = false;
        });
      }, false);

      $window.addEventListener("online", function() {
        $rootScope.$apply(function() {
          $rootScope.online = true;
        });
      }, false);


    $rootScope.time_format = 'YYYY-MM-DDTHH:mm:ssZ';
    $rootScope.time_format_polyfill= 'YYYY-MM-DDTHH:mm';
    $rootScope.baselayers = {
      googleRoadmap: {
        name: 'Google Streets',
        layerType: 'ROADMAP',
        type: 'google',
        layerParams: {
          showOnSelector: true
        }
      },
      googleHybrid: {
        name: 'Google Hybrid',
        layerType: 'HYBRID',
        type: 'google'
      },
      osm: {
        name: 'OpenStreetMap',
        url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        type: 'xyz'
      },
      esriwsm: {
        name: 'Esri World StreetMap',
        type: 'xyz',
        url: 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}'
      },
      esrisatellite: {
        name: 'Esri Satellite',
        type: 'xyz',
        url: 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      }
    };
});
