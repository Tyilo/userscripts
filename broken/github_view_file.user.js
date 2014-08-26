// ==UserScript==
// @id             github_view_file@tyilo.com
// @name           GitHub View File
// @version        0.1
// @namespace      http://tyilo.com/
// @author         Asger Drewsen <asgerdrewsen@gmail.com>
// @description    Adds a view button next to the raw button on files on GitHub
// @include        https://github.com/*/*/blob/*
// @run-at         document-end
// @updateURL      https://raw.github.com/Tyilo/userscripts/master/github_view_file.user.js
// ==/UserScript==
var $ = window.unsafeWindow? window.unsafeWindow.$: window.$;
$(function() {
	var raw = $('#raw-url');
	var view = raw.clone();
	view.attr('id', 'view-url');
	view.attr('href', '//rawgithub.com' + raw.attr('href').replace(/^(\/\w*\/\w*)\/raw(.*)$/, '$1$2'));
	view.text('View');
	raw.after(view);
});
