// ==UserScript==
// @name         Fix academy
// @namespace    http://tyilo.com/
// @version      0.3.7
// @description  ...
// @author       Tyilo
// @match        https://beeracademy.nu/*
// @exclude      https://beeracademy.nu/admin/*
// @downloadURL  https://gist.githubusercontent.com/Tyilo/57eac686585b79460550/raw/
// @updateURL    https://gist.githubusercontent.com/Tyilo/57eac686585b79460550/raw/
// @grant        none
// ==/UserScript==

function gamesWithPlayers(names) {
    var games = [];

    $('tr[data-parent="game"]').each(function(i, e) {
        var participants = $(e).find('td').eq(1).text().split(', ');
        var matches = true;
        for(var i = 0; i < names.length; i++) {
            if(participants.indexOf(names[i]) === -1) {
                matches = false;
            }
        }
        if(matches) {
            games.push(e);
        }
    });

    return games;
}

// Æggesækken
function colorNames(names) {
    var games = gamesWithPlayers(names);

    for(var game of games) {
        game.setAttribute('style', 'background-color: pink !important;');
    }
}

var playerIds = [
    51,  // Machon
    285, // Klaus
    349, // Asger
];

var cachedNames = JSON.parse(localStorage.eggNames || '[]');

if(cachedNames && cachedNames instanceof Array && cachedNames.length === playerIds.length) {
    colorNames(cachedNames);
}

var requests = [];
for(var i = 0; i < playerIds.length; i++) {
    requests.push($.get('/profile/view?id=' + playerIds[i]));
}

$.when.apply($, requests).done(function() {
    var names = [];
    for(var i = 0; i < playerIds.length; i++) {
        var name = $(arguments[i][0]).find('.profile-view h1').text().replace(/ \(ADMIN\)$/, '');
        names.push(name);
    }
    localStorage.eggNames = JSON.stringify(names);
    colorNames(names);
});