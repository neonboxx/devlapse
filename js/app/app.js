var devlapse = angular.module('devlapse', ['ngResource']);
var manifest = chrome.runtime.getManifest();

devlapse.controller('DomainListControl', function ($scope) {

  // var User = $resource('/user/:userId', {userId:'@id'});
  // User.get({userId:123}, function(u, getResponseHeaders){
  //   u.abc = true;
  //   u.$save(function(u, putResponseHeaders) {
  //     //u => saved user object
  //     //putResponseHeaders => $http header getter
  //   });
  // });
  
  try{
		$scope.domains = JSON.parse(localStorage.getItem('domains'));	
  }
  catch(exception){
  		$scope.domains =[];
  }

  if(!$scope.domains)
  		$scope.domains =[];

  $scope.addDomain = function(){
  	if($scope.newDomain != undefined)
  	{
  		$scope.domains.push($scope.newDomain)
  		$scope.newDomain = undefined;
  		$scope.saveDomains()
  	}

  }

  $scope.getThumb = function(image){
    var extLocation = image.lastIndexOf(".");
    return image.substring(0, extLocation) + "t" + image.substr(extLocation);
  }

  $scope.removeDomain = function(item) { 
  var index = $scope.domains.indexOf(item);
  $scope.domains.splice(index, 1);  
   $scope.saveDomains();   
}
  
  $scope.saveDomains = function(){
  	localStorage.setItem('domains',JSON.stringify($scope.domains))
  }



  console.log($scope.domains)
});

devlapse.controller('LoginControl', function ($scope) {
	
	var authParams = localStorage.getItem('auth_params')
	if(authParams)
	{
		authParams = JSON.parse(authParams)
		$scope.loggedIn = true;
		$scope.username = authParams.account_username
	}
  else
  {
    $scope.loggedIn = false;
    $scope.username = '';
  }

	$scope.logout = function(){
		$scope.loggedIn = false
		localStorage.removeItem('auth_params')
		localStorage.removeItem('token')
	}
	$scope.login = function(){
		var client_id = manifest.oauth2.client_id;
  	var state = Math.random().toString(36).substring(7);
    var authorize_url = manifest.oauth2.authorize_url;
		chrome.identity.launchWebAuthFlow(
  			{
  				'url': authorize_url+'?client_id='+client_id+'&response_type=token&state='+state, 
  				'interactive': true
  			},
			function(redirect_url) 	
			{ 
  				var tokensttr = redirect_url.substring(redirect_url.indexOf('#access_token')+1);
        		authParams = JSON.parse('{"'+tokensttr.replace(/=/g,'":"').replace(/&/g,'","')+'"}')
        		var accessToken = "Bearer "  + authParams.access_token;
            var state_pattern = '?state=';
            var state_loc = redirect_url.indexOf(state_pattern);
            var responseState =state_loc>-1? redirect_url.substring(state_loc+state_pattern.length,state_loc+state_pattern.length+state.length):undefined;
        		

            localStorage.setItem("token", accessToken);
        		localStorage.setItem("auth_params", JSON.stringify(authParams));
        		$scope.loggedIn = true;
        		$scope.username = authParams.account_username

            if(!responseState || state!==responseState)
              alert('possible spoofed response');
            $scope.$apply();
			});
	}
});