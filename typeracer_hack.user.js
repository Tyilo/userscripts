// ==UserScript==
// @id             typeracer_hack@tyilo.com
// @name           Typeracer Hack
// @version        1.0
// @namespace      http://tyilo.com/
// @author         Asger Drewsen <asgerdrewsen@gmail.com>
// @description    Press space to win!
// @include        http://play.typeracer.com/*
// @run-at         document-start
// @updateURL      https://raw.github.com/Tyilo/userscripts/master/typerace_hack.user.js
// ==/UserScript==

if(!window.unsafeWindow) {
    window.unsafeWindow = window;
}

function loadScript(url, callback)
{
	// adding the script tag to the head as suggested before
	var head = document.getElementsByTagName('head')[0];
	var script = document.createElement('script');
	script.type = 'text/javascript';
	script.src = url;
	
	// then bind the event to the callback function 
	// there are several events for cross browser compatibility
	script.onreadystatechange = callback;
	script.onload = callback;
	
	// fire the loading
	head.appendChild(script);
}

function setText(el) {
	el.value = document.querySelector('*[id^="nhwMiddlegwt"]').textContent + document.querySelector('*[id^="nhwMiddleCommagwt"]').textContent;
}

function init() {
	unsafeWindow.jQuery('body').on('keydown', 'input.txtInput', function() {
		if(this.value === '') {
			setText(this);
		}
	});
}

loadScript('https://ajax.googleapis.com/ajax/libs/jquery/1.9.0/jquery.min.js', function() {
	unsafeWindow.jQuery(init);
});
