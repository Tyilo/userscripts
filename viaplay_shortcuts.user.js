// ==UserScript==
// @name         ViaPlay shortcuts
// @version      0.1
// @match        http://viaplay.dk/player*
// @grant        none
// ==/UserScript==
window.addEventListener('keydown', function(e) {
    if (e.key === 'f') {
        if (document.fullscreenElement === null) {
            document.body.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }
});
