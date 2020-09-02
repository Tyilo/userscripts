// ==UserScript==
// @name Codejam auto-language picker
// @namespace Tyilo
// @match https://codingcompetitions.withgoogle.com/*
// @grant none
// ==/UserScript==

var EXTENSION_MAP = {
    cpp: 'C++ (G++)',
    py:  'PyPy 2',
};
var DEFAULT_EXT = 'py';

(function() {
    var filePicker = document.getElementsByName('upload')[0];
    var languagePicker = document.querySelector('.language-selector-menu');
  
    if (!filePicker || !languagePicker) return;

    function selectByText(select, text) {
        var options = select.querySelectorAll('li');
        for (var i = 0; i < options.length; i++) {
            var option = options[i];
            if (option.textContent.trim() === text) {
                option.click();
                break;
            }
        }
    }

    function setLanguage(extension) {
        var language;
        if (!EXTENSION_MAP.hasOwnProperty(extension)) {
            language = DEFAULT_EXT; 
        } else {
            language = EXTENSION_MAP[extension];
        }

        selectByText(languagePicker, language);
    }

    filePicker.addEventListener('change', function() {
        if (filePicker.files.length === 0) return;

        var filename = filePicker.files[0].name;
        var filenameParts = filename.split('.');
        if (filenameParts.length < 2) return;

        var extension = filenameParts[filenameParts.length - 1];

        setLanguage(extension);
    });
})();