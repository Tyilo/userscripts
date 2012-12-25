// ==UserScript==
// @name         It's learning redirector
// @namespace    http://tyilo.com/
// @version      0.1
// @description  enter something useful
// @include      https://aarhustech.itslearning.com/*
// @run-at       document-start
// @copyright    2011+, Asger Drewsen
// ==/UserScript==
switch(window.location.pathname.toLowerCase())
{
    case '/':
    case '/index.aspx':
    case '/elogin%20':
        window.location.pathname = '/elogin/';
    break;
}
