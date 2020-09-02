// ==UserScript==
// @name         Knakke bygningenavne
// @namespace    http://tyilo.com/
// @version      0.1
// @description  Ja
// @author       Tyilo
// @match        http://skema.knakke.dk/*
// @grant        none
// ==/UserScript==

var buildingNames = {
	5340: 'Babbage',
	5341: 'Turing',
	5342: 'Ada',
	5343: 'Bush',
	5344: 'Benjamin',
	5345: 'Dreyer',
	5346: 'Hopper',
	5347: 'Wiener'
};

var buildingLinks = document.querySelectorAll('a[href^="http://www.au.dk/da/kort/byg"]');
for(var i = 0; i < buildingLinks.length; i++) {
    var link = buildingLinks[i];
    var name = buildingNames[link.textContent];
    if(name) {
        link.previousSibling.textContent = link.previousSibling.textContent.replace(' (', ', ' + name + ' (');
    }
}