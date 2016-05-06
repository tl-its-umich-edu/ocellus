'use strict';
/* jshint  strict: true*/
/* global angular, _ */

angular.module('ocellusFilters', []).filter('categorize', function($rootScope) {
   return function(categoryKey) {
     var category = _.findWhere($rootScope.event_categories, {'key':categoryKey});
     return category.label;
  };
});
