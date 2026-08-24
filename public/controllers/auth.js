var myApp = angular.module("loginApp", []);

myApp.controller("Logintrl", ["$scope", "$http", "$window", function ($scope, $http, $window) {
  $scope.message = "Create your account.";
  $scope.messageLogin = "Enter your username/email and password.";

  $scope.registration = function () {
    if (!$scope.user) {
      $scope.message = "Please complete the form.";
      return;
    }

    $http.post("/auth/registration", $scope.user)
      .then(function (response) {
        $window.location.href = "/profile";
      })
      .catch(function (error) {
        $scope.message = (error.data && error.data.message) || "Registration failed.";
      });
  };

  $scope.login = function () {
    if (!$scope.user) {
      $scope.messageLogin = "Please enter your credentials.";
      return;
    }

    $http.post("/auth/login", $scope.user)
      .then(function () {
        $window.location.href = "/profile";
      })
      .catch(function (error) {
        $scope.messageLogin = (error.data && error.data.message) || "Login failed.";
      });
  };
}]);
