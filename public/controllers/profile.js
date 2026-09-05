var myApp = angular.module('profileApp',['ngCookies']);

myApp.controller('Profilectrl',['$scope','$http','$window',function($scope,$http,$window){
  $scope.user = 'Loading...';

  $http.get('/auth/me').then(function(response){
    $scope.user = response.data.username;
  }, function(){
    $window.location.href = '/login';
  });

  $scope.logout = function(){
    $http.post('/auth/logout').finally(function(){
      $window.location.href = '/';
    });
  };
}]);
