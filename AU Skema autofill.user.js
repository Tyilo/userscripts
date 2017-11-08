// ==UserScript==
// @name         AU Skema autofill
// @namespace    http://tyilo.com/
// @version      0.1
// @description  ...
// @author       Tyilo
// @match        http://timetable.scitech.au.dk/apps/skema/VaelgElevskema.asp*
// @grant        none
// ==/UserScript==
var el = document.querySelector('[name=aarskort]');
if (el) {
    el.value = '201407296';
}