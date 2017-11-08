// ==UserScript==
// @name         Redirect Wikipedia Mobile
// @namespace    http://tyilo.com/
// @version      0.1
// @description  ...
// @author       Tyilo
// @match        *://*.m.wikipedia.org/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

location.hostname = location.hostname.replace(/m\.wikipedia\.org$/, 'wikipedia.org');