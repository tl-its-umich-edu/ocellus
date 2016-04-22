'use strict';
/* global angular */

var ocellus = angular.module( "ocellus", [ 'ui-leaflet' ] );

ocellus.run(function($rootScope) {
  $rootScope.server = '';
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
});
