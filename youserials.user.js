// ==UserScript==
// @name         YouSerials shower
// @namespace    http://tyilo.com/
// @version      0.1
// @description  Shows the serial from YouSerials skipping everything
// @include      http://*youserials.com/serial/*/*
// @copyright    2011+, Asger Drewsen
// @run-at       document-start
// ==/UserScript==
window.location.replace('http://www.youserials.com/jq_serial.php?id=' + String(document.location.href).match(/[0-9]*$/)[0]);
