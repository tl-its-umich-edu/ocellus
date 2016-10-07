/*jshint strict:false */
/* global angular */

angular.module('ocellusFilters', []).filter('textOnlyCategory', function($filter) {
  return function(category) {
    return ({
      'Study/Discussion': {
        icon: 'pencil',
        background: 'green'
      },
      'Course/Class': {
        icon: 'heart',
        background: 'red'
      },
      'Practice/Rehearsal': {
        icon: 'music',
        background: 'orange'
      },
      'Social Gathering': {
        icon: 'ice-lolly-tasted',
        background: 'yellow'
      },
      'Business/Networking': {
        icon: 'euro',
        background: 'darkred'
      },
      'Public Ceremony': {
        icon: 'king',
        background: 'darkgreen'
      },
      'Family': {
        icon: 'gift',
        background: 'purple'
      },
      'Sports': {
        icon: 'flash',
        background: 'rebeccapurple'
      },
      'Political/Rally': {
        icon: 'bullhorn',
        background: 'cadetblue'
      }
    }[String(category)] || {
      icon: 'record',
      background: 'blue'
    });
  };
}).filter('capitalize', function() {
    return function(input) {
      return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
    };
});
