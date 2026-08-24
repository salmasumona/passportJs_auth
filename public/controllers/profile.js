var myApp = angular.module("profileApp", []);

myApp.controller("Profilectrl", ["$scope", "$http", "$window", function ($scope, $http, $window) {
  $scope.loading = true;

  $http.get("/api/me")
    .then(function (response) {
      $scope.user = response.data;
    })
    .catch(function () {
      $window.location.href = "/login";
    })
    .finally(function () {
      $scope.loading = false;
    });

  $scope.logout = function () {
    $http.post("/logout")
      .finally(function () {
        $window.location.href = "/";
      });
  };
}]);
