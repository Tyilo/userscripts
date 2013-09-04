 // ==UserScript==
// @id             better4chanx@tyilo
// @name           Better 4chan X
// @version        1.2
// @namespace      http://tyilo.com/
// @author         Tyilo
// @description    
// @include        http://boards.4chan.org/*
// @include        https://boards.4chan.org/*
// @run-at         document-start
// @updateURL      https://raw.github.com/Tyilo/userscripts/master/better_4chanx.user.js
// ==/UserScript==

var enableFeatures = {
	autoresize: false,
	preload_images: true,
	newline_comment: true,
	autoresize_scrolling: true,
	thumbs_scrolling: true
};

window.addEventListener('DOMContentLoaded', function(event)
{
	var unsafeWindow = window.unsafeWindow || window;
	
	if(enableFeatures['autoresize'])
	{
		// Auto-resize all images on opening a thread in a new tab
		if(window.location.pathname.match(/^\/[^\/]*\/res\//))
		{
			setTimeout(function check_expand() {
				var el1 = document.querySelector('.expand-all-shortcut');
				var el2 = document.querySelector('.contract-all-shortcut');
				if(el1) {
					el1.click();
				} else if(!el2) {
					setTimeout(check_expand, 100);
				}
			}, 0);
		}
	}
	
	if(enableFeatures['preload_images'])
	{
		var thumbs = document.querySelectorAll('a.fileThumb');
		for(var i = 0; i < thumbs.length; i++)
		{
			var image = new Image();
			image.src = thumbs[i].getAttribute('href');
		}
	}
	
	if(enableFeatures['newline_comment'])
	{
		// Better image resize:
		document.querySelector('.opContainer + .replyContainer').style.clear = 'both';
	}
	
	var mousePosition = [];
	window.addEventListener('mousemove', function(event)
	{
		mousePosition = [event.x, event.y];
	});
	
	// Better scrolling with space:
	window.addEventListener('keydown', function(event)
	{
		var isExpanded = document.querySelector('.contract-all-shortcut');
		if(event.keyCode === 32 && !(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement))
		{
			var reverse = event.shiftKey;
			if(isExpanded)
			{
				if(!enableFeatures['autoresize_scrolling'])
				{
					return;
				}
				event.preventDefault();
				var images = document.querySelectorAll('img.full-image');
				var length = images.length;
				var currentScroll = window.pageYOffset;
				if(!reverse)
				{
					for(var i = 0; i < length; i++)
					{
						if(images[i].y > currentScroll)
						{
							unsafeWindow.scrollTo(0, images[i].y);
							break;
						}
					}
					if(i === length) //At last image
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
					if(i === -1) //At first image
					{
						unsafeWindow.scrollTo(0, 0);
					}
				}
			}
			else
			{
				if(!enableFeatures['thumbs_scrolling'])
				{
					return;
				}
				var hover = document.elementFromPoint(mousePosition[0], mousePosition[1]);
				console.log(mousePosition, hover);
				if(hover instanceof HTMLImageElement)
				{
					event.preventDefault();
					var images = document.querySelectorAll('img:not(.full-image)');
					var length = images.length;
					var index = -1;
					if(!reverse)
					{
						for(var i = 0; i < length; i++)
						{
							if(images[i] === hover)
							{
								index = i + 1;
								break;
							}
						}
					}
					else
					{
						for(var i = length - 1; i >= 0; i--)
						{
							if(images[i] === hover)
							{
								index = i - 1;
								break;
							}
						}
					}
					if(index === length || index === -1)
					{
						if(!reverse)
						{
							unsafeWindow.scrollTo(0, 999999);
						}
						else
						{
							unsafeWdindow.scrollTo(0, 0);
						}
					}
					else
					{
						unsafeWindow.scrollTo(0, images[index].y + images[index].height / 2 - mousePosition[1]);
					}
				}
			}
		}
	});
});
