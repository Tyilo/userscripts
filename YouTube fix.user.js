// ==UserScript==
// @name         YouTube fix
// @namespace    tyilo
// @version      0.1
// @description  enter something useful
// @author       You
// @match        https://www.youtube.com/watch?v=*
// @match        http://www.youtube.com/watch?v=*
// @grant        none
// @run-at       document-start
// ==/UserScript==
var plays = 0;
var originalPlay = HTMLVideoElement.prototype.play
HTMLVideoElement.prototype.play = function() {
    plays++;
    originalPlay.apply(this, arguments);
    if(plays === 1 && !location.search.match(/(\?|&)list=/)) {
        this.pause();
    }
};