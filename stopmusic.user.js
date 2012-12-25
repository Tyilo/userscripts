// ==UserScript==
// @id             stopmusic4chan@tyilo
// @name           :stopmusic:
// @version        1.0
// @namespace      http://tyilo.com/
// @author         Tyilo
// @description    Stops the background music on 4chan
// @include        *://boards.4chan.org/*/*
// @run-at         document-end
// ==/UserScript==

var music = document.querySelector('embed, object');
if(music) {
    music.style.display = 'none';
}
