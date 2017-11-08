// ==UserScript==
// @id             world60pengscheckboxes@tyilo.com
// @name           World 60 Pengs Checkboxes
// @version        1.0.1
// @namespace      http://tyilo.com/
// @author         Asger Drewsen <asgerdrewsen@gmail.com>
// @description    ...
// @include        http://world60pengs.com/
// @include        http://world60pengs.com/#*
// @run-at         document-end
// ==/UserScript==

function getPengs() {
    return Array.prototype.slice.call(document.querySelectorAll('.penghead'));
}

function getWeekId() {
	// return String(Math.floor((new Date()) / (7 * 24 * 60 * 60 * 1000)));
	return document.querySelector('.contenttitle').textContent;
}

var pengs = getPengs();

var weekId = getWeekId();
var pengStatus;

if(localStorage.weekId === weekId) {
    pengStatus = JSON.parse(localStorage.pengStatus);
} else {
    pengStatus = new Array(pengs.length);
}

localStorage.weekId = weekId;
localStorage.pengStatus = JSON.stringify(pengStatus);

function statusChanged(event) {
    var checkbox = event.target;
    var num = pengs.indexOf(checkbox.parentElement);
    pengStatus[num] = checkbox.checked;
    localStorage.pengStatus = JSON.stringify(pengStatus);
}

var updatingPengs = false;

function updatePengs() {
    updatingPengs = true;
    
    pengs = getPengs();
    var oldWeekId = weekId;
    weekId = getWeekId();
    
    if(weekId !== oldWeekId) {
    	localStorage.weekId = weekId;
    	pengStatus = new Array(pengs.length);
    	localStorage.pengStatus = JSON.stringify(pengStatus);
    }
    
    for(var i = 0; i < pengs.length; i++) {
        var checkbox = document.createElement('input');
        checkbox.setAttribute('type', 'checkbox');
        checkbox.checked = pengStatus[i];
        checkbox.addEventListener('change', statusChanged);
        var peng = pengs[i];
        peng.insertBefore(checkbox, peng.firstChild);
    }
    
    updatingPengs = false;
}

var timeoutId = -1;

document.querySelector('#pengdata').addEventListener('DOMNodeInserted', function() {
    if(updatingPengs) {
        return;
    }
    
    if(timeoutId !== -1) {
        clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(updatePengs, 100);
});

updatePengs();