var myApp = angular.module('loginApp',['ngCookies']);

myApp.controller('Logintrl',['$scope','$http','$window','$cookieStore',function($scope,$http,$window,$cookieStore){
	
	$scope.message = "Please enter your username and password for registration.";
	$scope.messageLogin = "Please enter your username and password for login";
	$scope.registration = function(){
		if($scope.user!=undefined){
			console.log($scope.user);
			if($scope.user.username!="" && $scope.user.username.length>=4 && $scope.user.password!="" && $scope.user.cpassword!="" && $scope.user.password==$scope.user.cpassword){
					$http.post("/auth/registration",$scope.user).success(function(response){
						if(!response.username){
							$scope.message = response;
						}else{
							$cookieStore.put('loggeduser', response.username);
						    $window.location.href = "/profile";							
						}
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
				console.log($scope.user);
				if($scope.user.username!="" && $scope.user.username.length>=4 && $scope.user.password!=""){
								$http.post("/auth/login",$scope.user).success(function(response){
									console.log(response);
									if(!response.username){
										$scope.message = response;	
									}
								    if (response.username){
								    	$cookieStore.put('loggeduser', response.username);
								        $window.location.href = "/profile";
								    }
			
										
								});
						}
					}
			//alert($scope.user);
		};
	


	
	
}]);