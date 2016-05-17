'use strict';
/* jshint  strict: true*/
/* global angular, _, moment */

angular.module('ocellusFilters', []).filter('displayDate', function($filter) {
   return function(event) {
    var startTimeM = moment(event.startTime);
    var endTimeM = moment(event.endTime);
    var startD = $filter('date')(new Date(event.startTime), 'medium');
    var endShortD = $filter('date')(new Date(event.endTime), 'shortTime');
    var endLongD = $filter('date')(new Date(event.endTime), 'medium');
    if (startTimeM.startOf('day').isSame(endTimeM.startOf('day'))) {
      return  startD + ' - ' + endShortD;
    } else {
      return  startD + ' - ' + endLongD;
    }
  };
});
