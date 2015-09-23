var app = angular.module('dumplingApp',['ngSanitize','ngCookies','ngMaterial','ngRoute','ngDragDrop']).config(function($mdIconProvider) {
  $mdIconProvider
  .iconSet("call", 'img/icons/sets/communication-icons.svg', 24)
  .iconSet("social", 'img/icons/sets/social-icons.svg', 24);
});


app.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/home', {
        templateUrl: 'app/view/spheres/index.html'
      }).
      when('/entitiesStructure', {
        templateUrl: 'app/view/spheres/entitiesStructure.html'
      }).
      otherwise({
        redirectTo: '/home'
      });
  }]);