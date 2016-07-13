/*jshint strict:false */
/* global angular */

var ocellus = angular.module( 'ocellus', [ 'ui-leaflet', 'ocellusFilters'] );

ocellus.run(function($rootScope) {
    $rootScope.server = '';
    $rootScope.currentView="Current";
    $rootScope.user = {};
    $rootScope.currentMapKey='AIzaSyBJfRs5m2aIl3cKjMy0es9Fh6-EJeXpP4k';
    $rootScope.currentMapAPI = 'google';
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
      googleTerrain: {
        name: 'Google Terrain',
        layerType: 'TERRAIN',
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
