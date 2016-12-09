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
}).filter('readableDistance', function() {
    return function(input) {
      var distance ='';
      if (input){
        if (input < 1) {
          distance =  (input * 1760).toString().split('.')[0] + ' yards';
        } else {
          distance = input.toString().split('.')[0] + ' miles';
        }
      }
      return distance;
    };
});
