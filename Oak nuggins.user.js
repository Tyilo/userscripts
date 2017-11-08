// ==UserScript==
// @name         Oak nuggins
// @namespace    http://tyilo.com/
// @version      0.1
// @description  https://a.pomf.cat/mnwdyt.jpg
// @author       Tyilo
// @match        http://*/*
// @match        https://*/*
// @grant        none
// ==/UserScript==

var dict = {
    'ok': 'Oak nuggins',
    'Yes': 'Yank train',
    'No': 'Nuns on ripple',
    'I think so': 'I put a boogie dollar down',
    'Do you play golf?': 'Do you slap the dimpled balls?',
    'I feel sick': 'Mama\'s got the nasty jam',
    'That\'s a good idea': 'That\'s a gold hat, cool cat',
    'This job is killing me': 'This gig gonna slash me hips',
    'Let\'s grab lunch on Monday': 'Dip me in ya Monday milk',
};

function escapeRegex(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

function fixText(str) {
    for (let k in dict) {
        str = str.replace(new RegExp('\\b' + escapeRegex(k) + '\\b', 'gi'), dict[k]);
    }
    return str;
}

function fixAttr(node, key) {
    const newText = fixText(node[key]);
    if (newText !== node[key]) {
        node[key] = newText;
    }
}

function fixNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
        fixAttr(node, 'nodeValue');
    } else {
        if (node.nodeName === 'INPUT') {
            fixAttr(node, 'value');
        }
        for (let n of node.childNodes) {
            fixNode(n);
        }
    }
}

const observer = new MutationObserver(function(mutations) {
    for (let m of mutations) {
        if (m.type === 'characterData') {
            fixNode(m.target);
        }
        for (let n of m.addedNodes) {
            fixNode(n);
        }
    }
});

observer.observe(document.body, {childList: true, characterData: true, subtree: true});

window.addEventListener('keypress', function(e) {
    fixNode(e.target);
});
window.addEventListener('keyup', function(e) {
    fixNode(e.target);
});

fixNode(document.body);