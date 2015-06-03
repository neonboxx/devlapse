chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
  	chrome.pageAction.show(sender.tab.id);
    sendResponse();
  });


chrome.tabs.onActivated.addListener(function(activeInfo) {
    //{ tabId, windowId }
    localStorage.setItem("activeTab", activeInfo.tabId);
    //console.log("set", activeInfo.tabId)
  })

  chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    
    if(changeInfo.status != "complete") return;

    if(!localStorage.getItem("domains")) return;

    var activeTab = localStorage.getItem("activeTab");
    var domains = localStorage.getItem("domains");
    domains = JSON.parse(domains);

    if(+activeTab === tabId) {
      //check if this tab's url matches one we are listening on
      for(var i = domains.length; i--;) {
        if(tab.url.indexOf(domains[i].host) >-1 && domains[i].enabled) {
          
          localStorage.setItem("domains", JSON.stringify(domains));
          setTimeout(takeScreenshot, domains[i].delay, domains[i], tab,function(domain){
            chrome.browserAction.setBadgeText({text:domain.count.toString(),tabId:tabId})
          	domains[i] = domain
          	localStorage.setItem("domains", JSON.stringify(domains));
          });
        }
      }
    }
  });
function duplicateImage(domain,image)
{
  if(domain.archive)
  {
    if(domain.archive.indexOf(image)>-1)
      return true;
  }
  else
  {
    domain.archive = [];
  }
  if(domain.archive.length >=10)
    domain.archive = domain.archive.slice(Math.max(domain.archive.length - 9, 1))
  domain.archive.push(image);
  return false;

}
function takeScreenshot(domain, tab,callback) {
    //console.log("taking screenshot", dirname, tab);
    chrome.tabs.captureVisibleTab(null, null, function(img) {
      var screenshotUrl = img;
      if(!img || !img.length) 
      	return;

      if(duplicateImage(domain,img))
        return;

      if(localStorage.getItem('token') == null)
      {
      	alert('Dev-Lapse: you need to log in to imgur, click the extension icon')
      	return;
      }
      img = img.substring(img.indexOf(',')+1)
      var attempts = 0;
	  	$.ajax({
		    url: 'https://api.imgur.com/3/image',
		    type: 'post',
		    data: {
		        album:domain.album,
            	image:img
		    },
		    headers: {
		        'Authorization': localStorage.getItem('token')
		    },
		    dataType: 'json',
		    success: function (response) {
		        if(!domain.count) 
          			domain.count = 0;
          		domain.count += 1
          		if(!domain.images)
          			domain.images=[];
              if(domain.images.length >=10)
                domain.images = domain.images.slice(Math.max(domain.images.length - 9, 1))
          		domain.images.push(response.data.link)
              if(typeof callback == 'function')
          			callback(domain);
		    },
        	error:function(response){
            	if(response.status == 401)
            	{
            		localStorage.removeItem('token')
            		alert('Dev-Lapse: you need to log in to imgur, click the extension icon')
            	}
              else if(response.status == 403)
              {
                var failedReq = this;
                if(attempts<1)
                {
                  var auth_params = JSON.parse(localStorage.getItem('auth_params'));
                  attempts++;
                  $.ajax({
                      url: 'https://api.imgur.com/oauth2/token',
                      type: 'post',
                      data: {
                          refresh_token:auth_params.refresh_token,
                          client_id:'294b9e58049ee94',
                          client_secret:'4ee2dfe26eafb786b60ac7399aa6c8b4357343e5',
                          grant_type:'refresh_token'
                      },
                      headers: {
                          'Authorization': localStorage.getItem('token')
                      },
                      dataType: 'json',
                      success: function (response) {
                          var token = "Bearer "+response.access_token;
                          localStorage.setItem('auth_params',JSON.stringify(response));
                          localStorage.setItem('token',token);
                          failedReq.headers['Authorization'] = token;
                          $.ajax(failedReq);
                      },
                      error:function(response){
                        localStorage.removeItem('auth_params')
                        localStorage.removeItem('token')
                        alert('Dev-Lapse: you need to log in to imgur, click the extension icon')
                      }
                  });
                }

              }
        	}
		});



    });

  }