'use strict';
/* jshint  strict: true*/
/* global angular, _ */

angular.module('ocellusFilters', []).filter('categorize', function() {
   return function(categoryKey,categoryObject) {
     var category = _.findWhere(categoryObject, {'key':categoryKey});
     return category;
  };
});
