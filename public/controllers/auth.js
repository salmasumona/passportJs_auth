var myApp = angular.module('loginApp',['ngCookies']);

myApp.controller('Logintrl',['$scope','$http','$window','$cookieStore',function($scope,$http,$window,$cookieStore){
	
	$scope.message = "Please enter your username and password for registration.";
	$scope.messageLogin = "Please enter your username and password for login";
	function errorMessage(response) {
		return response.data && response.data.message ? response.data.message : "Something went wrong. Please try again.";
	}
	$scope.registration = function(){
		if($scope.user!=undefined){
			if($scope.user.username!="" && $scope.user.username.length>=4 && $scope.user.password!="" && $scope.user.cpassword!="" && $scope.user.password==$scope.user.cpassword){
					$http.post("/auth/registration",$scope.user).then(function(response){
						if(response.data.username){
					    $cookieStore.put('loggeduser', response.data.username);
						    $window.location.href = "/profile";							
						}
					}, function(response){
						$scope.message = errorMessage(response);
					});
			}else if($scope.user.username=="" || $scope.user.password==""){
				$scope.message = "Please enter your username and password. These fields can not be empty.";

			}else if($scope.user.username.length<4){
				$scope.message = "Username minimum length 4. ";

			}else if($scope.user.password!=$scope.user.cpassword){
				$scope.message = "Password not matches with confirm password";

			}
		}
		//alert($scope.user);
	};

	$scope.login = function(){
			if($scope.user!=undefined){
				if($scope.user.username!="" && $scope.user.username.length>=4 && $scope.user.password!=""){
								$http.post("/auth/login",$scope.user).then(function(response){
									if (response.data.username){
										$cookieStore.put('loggeduser', response.data.username);
										$window.location.href = "/profile";
									}
								}, function(response){
									$scope.messageLogin = errorMessage(response);
								});
						}
					}
			//alert($scope.user);
		};
	


	
	
}]);
