// ==UserScript==
// @name         Kattis Improvements
// @namespace    https://tyilo.com/
// @version      0.2.5
// @description  ...
// @author       Tyilo
// @match        https://*.kattis.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

var funcs = [
  [addInfluence, ["/universities/[^/]+", "/countries/[^/]+"]],
  [resubmitLink, ["/submissions/[^/]+"]],
  [openKattisLink, [".*"]],
];

for (var i = 0; i < funcs.length; i++) {
  var f = funcs[i][0];
  var regexps = funcs[i][1];
  for (var j = 0; j < regexps.length; j++) {
    if (document.location.pathname.match(new RegExp("^" + regexps[j] + "$"))) {
      f();
      break;
    }
  }
}

function addInfluence() {
  var f = 5;

  var tables = document.querySelectorAll(".main-content table");
  var table = tables[tables.length - 1];
  table.querySelector("thead tr").innerHTML += "<th>Influence</th>";
  var rows = table.querySelectorAll("tbody tr");
  var influences = [];
  var total_influence = 0;
  for (var i = 0; i < rows.length; i++) {
    var score = parseFloat(
      rows[i].querySelector("td:last-of-type").textContent
    );
    var influence = (1 / f) * Math.pow(1 - 1 / f, i) * score;
    influences.push(influence);
    total_influence += influence;
  }
  for (var i = 0; i < rows.length; i++) {
    var percentage = ((influences[i] / total_influence) * 100).toFixed(1);
    rows[i].innerHTML +=
      "<td>" + influences[i].toFixed(1) + " (" + percentage + "%)</td>";
  }
}

function resubmitLink() {
  var problem_link = document.querySelector('a[href^="/problems/"]');
  var resubmit_link = document.createElement("a");
  resubmit_link.href = problem_link.href + "/submit";
  resubmit_link.textContent = "(resubmit)";
  document.querySelector("h1").appendChild(document.createTextNode(" "));
  document.querySelector("h1").appendChild(resubmit_link);
}

function openKattisLink() {
  var openKattisHost = "open.kattis.com";
  var otherHost;
  if (location.host === openKattisHost) {
    otherHost = GM_getValue("lastHost");
    // Disable on open.kattis.com for now
    return;
  } else {
    GM_setValue("lastHost", location.host);
    otherHost = openKattisHost;
  }

  if (!otherHost) return;

  var nav = document.querySelector(".main-nav ul");
  var link = document.createElement("a");
  link.href = location.href.replace(location.host, otherHost);
  link.textContent = otherHost;
  var container = document.createElement("li");
  container.appendChild(link);
  nav.appendChild(container);
}
