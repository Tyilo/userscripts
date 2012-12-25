// ==UserScript==
// @id             fixsopawiki@tyilo
// @name           Remove SOPA overlay for wikipedia
// @version        1.0
// @namespace      http://tyilo.com/
// @author         Tyilo
// @description    
// @include        http://*.wikipedia.org/*
// @match        http://*.wikipedia.org/*
// @run-at         document-start
// ==/UserScript==
if(!GM_addStyle)
{
    var GM_addStyle = function(css)
    {
        var style = document.createElement('style');
        style.innerHTML = css;
        var timer = setInterval(function()
        {
            if(document.head)
            {
                clearInterval(timer);
                document.head.appendChild(style);
            }
        }, 0);
    };
}
GM_addStyle('#mw-sopaOverlay { display: none !important; } #mw-page-base, #mw-head-base, #content, #mw-head, #mw-panel, #footer { display: block !important; }');