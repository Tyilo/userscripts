// ==UserScript==
// @id             better4chanx@tyilo
// @name           Better 4chan X
// @version        1.0
// @namespace      http://tyilo.com/
// @author         Tyilo
// @description    
// @include        http://boards.4chan.org/*
// @include        http://sys.4chan.org/*
// @run-at         document-start
// ==/UserScript==

window.addEventListener('DOMContentLoaded', function(event)
{
    // Better image resize:
    document.querySelector('.opContainer + .replyContainer').style.clear = 'both';
    
    // Better scrolling:
    window.addEventListener('keydown', function(event)
    {
        if(event.keyCode == 32 && document.getElementById('imageExpand').checked && !(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement))
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
			window.scrollTo(0, images[i].y);
                        break;
                    }
                }
                if(i == length) //At last image
                {
                    window.scrollTo(0, 999999);
                }
            }
            else
            {
                for(var i = length - 1; i >= 0; i--)
		{
                    if(images[i].y < currentScroll)
                    {
			window.scrollTo(0, images[i].y);
                        break;
                    }
		}
                if(i == -1) //At first image
                {
                    window.scrollTo(0, 0);
                }
            }
	}
    });
});
