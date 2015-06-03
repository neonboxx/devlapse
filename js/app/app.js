var devlapse = angular.module('devlapse', []);

devlapse.controller('DomainListControl', function ($scope) {
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
	
	$scope.loggedIn = false;
	var authParams = localStorage.getItem('auth_params')
	if(authParams)
	{
		authParams = JSON.parse(authParams)
		$scope.loggedIn = true;
		$scope.username = authParams.account_username
	}

	$scope.logout = function(){
		$scope.loggedIn = false
		localStorage.removeItem('auth_params')
		localStorage.removeItem('token')
	}
	$scope.login = function(){
		var client_id = '294b9e58049ee94';
    	var client_secret = '2293120931946b8f8174e294888a01c8f8c48edb';
    	var state = 'nonsense'
		chrome.identity.launchWebAuthFlow(
  			{
  				'url': 'https://api.imgur.com/oauth2/authorize?client_id='+client_id+'&response_type=token&state='+state, 
  				'interactive': true
  			},
			function(redirect_url) 	
			{ 
  				var tokensttr = redirect_url.substring(redirect_url.indexOf('#access_token')+1);
        		authParams = JSON.parse('{"'+tokensttr.replace(/=/g,'":"').replace(/&/g,'","')+'"}')
        		var accessToken = "Bearer "  + authParams.access_token;

        		localStorage.setItem("token", accessToken);
        		localStorage.setItem("auth_params", JSON.stringify(authParams));
        		$scope.loggedIn = true;
        		$scope.username = authParams.account_username
			});
	}
});