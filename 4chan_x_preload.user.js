// ==UserScript==
// @name         4chan X preload
// @version      1.0
// @description  Yes
// @include      http://boards.4chan.org/*
// @include      https://boards.4chan.org/*
// @run-at       document-ready
// ==/UserScript==
function callback() {
    var current = document.querySelector('.gal-image img');
    if (!current) return;
    var id = parseInt(current.getAttribute('data-id'));
    for (var i = 1; i <= 5; i++) {
        var thumb = document.querySelector('.gal-thumb[data-id="' + (id + i) + '"]');
        if (!thumb) continue;
        var img = new Image();
        img.src = thumb.href;
    }
}

window.addEventListener('keyup', callback);
document.body.addEventListener('click', callback);