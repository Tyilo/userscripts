// ==UserScript==
// @name         Kattis Improvements
// @namespace    http://tyilo.com/
// @version      0.2.3
// @description  ...
// @author       Tyilo
// @match        https://*.kattis.com/*
// @grant        none
// @updateURL    https://github.com/Tyilo/userscripts/raw/master/kattis_improvements.user.js
// ==/UserScript==

var funcs = [
    [addInfluence, ['/universities/[^/]+', '/countries/[^/]+']],
    [resubmitLink, ['/submissions/[^/]+']]
];

for(var i = 0; i < funcs.length; i++) {
    var f = funcs[i][0];
    var regexps = funcs[i][1];
    for(var j = 0; j < regexps.length; j++) {
        if(document.location.pathname.match(new RegExp('^' + regexps[j] + '$'))) {
            f();
            break;
        }
    }
}

function addInfluence() {
    var f = 5;

    var tables = document.querySelectorAll('.main-content table');
    var table = tables[tables.length - 1];
    table.querySelector('thead tr').innerHTML += '<th>Influence</th>';
    var rows = table.querySelectorAll('tbody tr');
    for(var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var score = parseFloat(row.querySelector('td:last-of-type').textContent);
        var influence = 1/f * Math.pow(1 - 1/f, i) * score;
        row.innerHTML += '<td>' + influence.toFixed(1) + '</td>';
    }
}

function resubmitLink() {
    var problem_link = document.querySelector('a[href^="/problems/"]');
    var resubmit_link = document.createElement('a');
    resubmit_link.href = problem_link.href + '/submit';
    resubmit_link.textContent = '(resubmit)';
    document.querySelector('h1').appendChild(document.createTextNode(' '));
    document.querySelector('h1').appendChild(resubmit_link);
}
