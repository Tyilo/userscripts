// ==UserScript==
// @name           YouTube mp3 download
// @namespace      http://tyilo.com/
// @include        *://www.youtube.com/watch*
// @run-at         document-end
// ==/UserScript==
var mp3button = document.createElement('button');
mp3button.setAttribute('type', 'button');
mp3button.classList.add('yt-uix-button');
mp3button.classList.add('yt-uix-button-default');
mp3button.classList.add('yt-uix-tooltip');
mp3button.classList.add('yt-uix-tooltip-reverse');
mp3button.setAttribute('date-tooltip-text', 'Convert to mp3');
mp3button.addEventListener('click', function()
{
	window.open('http://www.youtube-mp3.org/#' + window.location.search.match(/v=[^&amp;]*/), 'mp3');
});
var label = document.createElement('span');
label.classList.add('yt-uix-button-content');
label.appendChild(document.createTextNode('mp3'));
mp3button.appendChild(label);
document.getElementById('watch-actions').appendChild(mp3button);
