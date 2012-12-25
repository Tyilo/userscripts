// ==UserScript==
// @id             fbpoke@tyilo
// @name           Facebook Pokebot
// @version        1.0
// @namespace      http://tyilo.com/
// @author         Tyilo
// @description    http://www.facebook.com/pokes
// @include        http://*.facebook.com/pokes*
// @include        https://*.facebook.com/pokes*
// @match          http://*.facebook.com/pokes*
// @match          https://*.facebook.com/pokes*
// @run-at         document-start
// @updateURL      http://tyilo.com/userscripts/fbpoke.user.js
// ==/UserScript==

document.addEventListener('DOMContentLoaded', function()
{
	if(!unsafeWindow || !unsafeWindow.$)
	{
		var div = document.createElement('div');
		div.setAttribute('onclick', 'return window;');
		unsafeWindow = div.onclick();
	}
	
    var hidden = document.createElement('div');
    hidden.style.display = 'none';
    document.body.appendChild(hidden);
    
    var links = [];
    
    var FB;
        
    unsafeWindow.fbAsyncInit = function() {
        FB = unsafeWindow.FB;
        FB.init({
            appId      : '348940045116665', // App ID
            status     : true, // check login status
            cookie     : true, // enable cookies to allow the server to access the session
            xfbml      : true  // parse XFBML
        });
        FB.getLoginStatus(function(response)
        {
        	if(response.status != 'connected')
			{
				button3.disabled = false;
				button3.addEventListener('click', function()
				{
					FB.login(function(response)
					{
						if(response.authResponse)
						{
							button3.disabled = true;
							getFriendList();
						}
					});
				});
			}
			else
			{
				getFriendList();
			}
			function getFriendList()
			{
				FB.api('/me/friends', function(friends)
				{
					friends.data.each(function(friend)
					{
						var link = document.createElement('a');
						link.setAttribute('ajaxify', '/ajax/pokes/poke_inline.php?uid=' + friend.id + '&amp;pokeback=0&amp;ask_for_confirm=0');
						link.setAttribute('rel', 'async-post');
						hidden.appendChild(link);
						links.push(link);
					});
					button2.disabled = false;
				});
			}
        });
    };
    
    var fbRoot = document.createElement('div');
    fbRoot.setAttribute('id', 'fb-root');
    document.body.appendChild(fbRoot);
    
  // Load the SDK Asynchronously
    (function(d){
        var js, id = 'facebook-jssdk'; if (d.getElementById(id)) {return;}
        js = d.createElement('script'); js.id = id; js.async = true;
        js.src = "//connect.facebook.net/en_US/all.js";
        d.getElementsByTagName('head')[0].appendChild(js);
    }(document));
    
    var button1 = document.createElement('button');
    var title1 = document.createTextNode('Initiate poke bot!');
    button1.appendChild(title1);
    button1.style.marginLeft = '3em';
    
    var button2 = document.createElement('button');
    var title2 = document.createTextNode('Poke all friends!');
    button2.appendChild(title2);
    button2.style.marginLeft = '3em';
    button2.disabled = true;
    
    var button3 = document.createElement('button');
    button3.textContent = 'Authorize...';
    button3.style.marginLeft = '3em';
    button3.disabled = true;
    
    var running = false;
    var timerId;
    button1.addEventListener('click', function()
    {
        if(!running)
        {
            timeId = setInterval(poke, 100);
            title1.textContent = 'Stop poke bot!';
        }
        else
        {
            clearInterval(timerId);
            title1.textContent = 'Initiate poke bot!';
        }
        running = ! running;
    });
    button2.addEventListener('click', function()
    {
        var done = 0;
        button2.disabled = true;
        for(var i = 0; i < links.length; i++)
        {
            click(links[i]);
        }
        var intervalId = setInterval(checkPokes, 100);
        function checkPokes()
        {
            done = hidden.querySelectorAll('[class~="highlight"]').length;
            title2.textContent = 'Poking: ' + done + '/' + links.length;
            if(done == links.length)
            {
            	clearInterval(intervalId);
            	hidden.innerHTML = '';
            	for(var i = 0; i < links.length; i++)
            	{
            		hidden.appendChild(links[i]);
            	}
                title2.textContent = 'Poke all friends!';
                button2.disabled = false;
            }
        }
    });
    function addButtons()
    {
        var header = document.querySelector('h2[class="uiHeaderTitle"] > i');
        if(header && header.parentNode)
        {
            clearInterval(intervalId);
            header.parentNode.appendChild(button1);
            header.parentNode.appendChild(button2);
            header.parentNode.appendChild(button3);
        }
    }
    var intervalId = setInterval(addButtons, 100);
    function poke()
    {
        var pokeLinks = document.querySelectorAll('div[id="pagelet_pokes"] a[ajaxify*="pokes"]');
        for(var i = 0; i < pokeLinks.length; i++)
        {
            click(pokeLinks[i]);
            pokeLinks[i].textContent = 'Poking...';
            pokeLinks[i].style.color = 'gray';
        }
    }
    //pokee(x, FB._userID, document.getElementById('post_form_id').value, document.getElementsByName('fb_dtsg')[0].value);
    function pokee(id, uid, form_id, token)
    {
    	var formData = new FormData();
    	formData.append('uid', id);
    	formData.append('nctr%5B_mod%5D', 'pagelet_pokes');
    	formData.append('post_form_id', form_id);
    	formData.append('post_form_id_source', 'AsyncRequest');
    	formData.append('__user', uid);
    	formData.append('fb_dgst', token);
    	var request = new XMLHttpRequest();
    	request.open('POST', '/ajax/pokes/poke_inline.php?pokeback=0&ask_for_confirm=0&__a=1&uid=' + id);
    	request.send(formData);
    }
    unsafeWindow.pokee = pokee;
    function click(element)
    {
        var event = document.createEvent('MouseEvent');
        event.initEvent('click', true, false);
        element.dispatchEvent(event);
    }
});
