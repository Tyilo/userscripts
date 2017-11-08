// ==UserScript==
// @name         Fix Blackboard
// @namespace    http://tyilo.com/
// @version      0.1
// @description  ...
// @author       Tyilo
// @match        https://bb.au.dk/*
// @grant        none
// @downloadURL  https://gist.githubusercontent.com/Tyilo/54e330cd4d45426d335f/raw/
// @updateURL    https://gist.githubusercontent.com/Tyilo/54e330cd4d45426d335f/raw/
// ==/UserScript==

if(document.location.pathname === '/webapps/blackboard/execute/content/file') {
    addDownloadLink();
}

function addDownloadLink() {
    var fname = document.getElementById('pageTitleText').textContent.trim();
    var url = document.getElementById('PDFEmbedID').src;

    var link = document.createElement('a');
    link.textContent = 'Download';
    link.href = url;
    link.download = fname;

    document.getElementById('pageTitleHeader').appendChild(link);
}