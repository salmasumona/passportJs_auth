var myApp = angular.module('profileApp',['ngCookies']);

myApp.controller('Profilectrl',['$scope','$http','$window','$cookieStore',function($scope,$http,$window,$cookieStore){

	$scope.user = $cookieStore.get('loggeduser');	
	$scope.logout = function(){	console.log("fff");	
		$http.get('/logout').success(function(response){
			$cookieStore.remove('loggeduser');
			$window.location.href = "/";
		});
	};

	
}]);