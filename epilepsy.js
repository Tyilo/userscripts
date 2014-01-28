// ==UserScript==
// @id             epilepsy@tyilo.com
// @name           Epilepsy
// @version        1.0
// @namespace      http://tyilo.com/
// @author         Asger Drewsen <asgerdrewsen@gmail.com>
// @description    ...
// @include        *://*
// @run-at         document-end
// @updateURL      https://raw.github.com/Tyilo/userscripts/master/epilepsy.js
// ==/UserScript==
var white = true;

var timeoutFunc = function(c) {
	setTimeout(c, 0);
};

var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || timeoutFunc;

requestAnimationFrame(function step() {
	document.body.style.backgroundColor = white? 'white': 'black';
	white = !white;
	requestAnimationFrame(step);
});
