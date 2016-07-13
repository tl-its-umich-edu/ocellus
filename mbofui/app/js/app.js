/*jshint strict:false */
/* global angular */

var ocellus = angular.module( 'ocellus', [ 'ui-leaflet', 'ocellusFilters'] );

ocellus.config(function($locationProvider) {
  $locationProvider.html5Mode({
    enabled: true,
    requireBase: false
  });
});


ocellus.run(function($rootScope) {
    $rootScope.server = '';
    $rootScope.currentView="Current";
    $rootScope.user = {};
    $rootScope.pollInterval = 15000;
    $rootScope.strings = {
      'app_name': 'Ocellus',
      'app_action':'Ocellize it',
      'app_categories':'Categories',
      'modal_title':'Event details',
      'modal_description':'Event description',
      'modal_starttime':'Start time',
      'modal_endtime':'End time',
      'modal_post':'Add Event'
    };
    $rootScope.event_categories = ['Course/Class','Practice/Rehearsal','Social Gathering','Business/Networking','Public Ceremony','Family','Sports','Political/Rally'];

    $rootScope.time_format = 'YYYY-MM-DDTHH:mm:ssZ';
    $rootScope.time_format_polyfill= 'YYYY-MM-DDTHH:mm';
    $rootScope.baselayers = {
      osm: {
        name: 'OpenStreetMap',
        url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        type: 'xyz'
      },
      terrain: {
        name: 'Terrain',
        url: 'http://stamen-tiles-{s}.a.ssl.fastly.net/terrain-background/{z}/{x}/{y}.png',
        type: 'xyz',
      },
      osmh: {
        name: 'OpenStreetMap Hot',
        type: 'xyz',
        url: 'http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
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
