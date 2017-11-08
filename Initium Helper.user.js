// ==UserScript==
// @name         Initium Helper
// @namespace    http://tyilo.com/
// @version      0.1
// @description  No
// @author       Tyilo
// @match        https://www.playinitium.com/*
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

function attack() {
    location.href = 'https://www.playinitium.com/ServletCharacterControl?type=attack&hand=LeftHand';
}

var gold = parseInt(document.querySelector('.header-stats').textContent.split(' ')[1].replace(/,/g, ''));

var charBox = document.querySelector('.character-display-box');
var hp = charBox.textContent.match(/(\d+)\/(\d+)/);
var currentHp = parseInt(hp[1]);
var maxHp = parseInt(hp[2]);

var loc = document.querySelector('.header-location').textContent;

// Auto rest
if(loc.match(/^Camp: /)) {
    if(currentHp < maxHp) {
        unsafeWindow.doRest();
    }
}

var lastLoc = GM_getValue('lastLoc', '');

// Fight
if(loc.match(/^Combat site: /)) {
    if(loc !== lastLoc) {
        // First in fight
        var autoAttack = confirm('Auto attack?');
        GM_setValue('autoAttack', autoAttack);
        if(autoAttack) {
            var stopAt = parseInt(prompt('Enter hp to stop auto attack at:', Math.min(currentHp - 1, Math.floor(maxHp / 2))));
            GM_setValue('autoAttack_stopAt', stopAt);
            attack();
        }
    } else if(GM_getValue('autoAttack')) {
        // Not first time in fight
        var stopAt = parseInt(GM_getValue('autoAttack_stopAt'));
        if(currentHp <= stopAt) {
            GM_setValue('autoAttack', false);
            alert('Stopped auto attack due to low health!');
        } else {
            attack();
        }
    }
}

GM_setValue('lastLoc', loc);