// ==UserScript==
// @id             stopaustralia@tyilo
// @name           :stopaustralia:
// @version        1.0
// @namespace      http://tyilo.com/
// @author         Asger Drewsen <asgerdrewsen@gmail.com>
// @description    
// @include        http://boards.4chan.org/b/*
// @run-at         document-end
// ==/UserScript==
document.body.removeChild(document.querySelector('body > style'));
