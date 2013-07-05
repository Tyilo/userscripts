// ==UserScript==
// @id             better4chanx@tyilo
// @name           Better 4chan X
// @version        1.1.1
// @namespace      http://tyilo.com/
// @author         Tyilo
// @description    
// @include        http://boards.4chan.org/*
// @include        https://boards.4chan.org/*
// @run-at         document-start
// @updateURL      https://raw.github.com/Tyilo/userscripts/master/better_4chanx.user.js
// ==/UserScript==

window.addEventListener('DOMContentLoaded', function(event)
{
	var unsafeWindow = window.unsafeWindow || window;
	
	// Auto-resize all images on opening a thread in a new tab
	if(window.location.pathname.match(/^\/[^\/]*\/res\//))
	{
		document.querySelector('.expand-all-shortcut').click();
	}
	
	// Better image resize:
	document.querySelector('.opContainer + .replyContainer').style.clear = 'both';
	
	// Better scrolling with space:
	window.addEventListener('keydown', function(event)
	{
		if(event.keyCode == 32 && document.querySelector('.contract-all-shortcut') && !(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement))
		{
			event.preventDefault();
			var images = document.querySelectorAll('img + img');
			var length = images.length;
			var currentScroll = window.pageYOffset;
			if(!event.shiftKey)
			{
				for(var i = 0; i < length; i++)
				{
					if(images[i].y > currentScroll)
					{
						unsafeWindow.scrollTo(0, images[i].y);
						break;
					}
				}
				if(i == length) //At last image
				{
					unsafeWindow.scrollTo(0, 999999);
				}
			}
			else
			{
				for(var i = length - 1; i >= 0; i--)
				{
					if(images[i].y < currentScroll)
					{
						unsafeWindow.scrollTo(0, images[i].y);
						break;
					}
				}
				if(i == -1) //At first image
				{
					unsafeWindow.scrollTo(0, 0);
				}
			}
		}
	});
});
