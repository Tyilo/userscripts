// ==UserScript==
// @id             better4chanx@tyilo
// @name           Better 4chan X
// @version        1.3
// @namespace      http://tyilo.com/
// @author         Tyilo
// @description    
// @include        http://boards.4chan.org/*
// @include        https://boards.4chan.org/*
// @run-at         document-start
// @updateURL      https://raw.github.com/Tyilo/userscripts/master/better_4chanx.user.js
// ==/UserScript==

var enableFeatures = {
	autoresize: false,
	preload_images: true,
	preload_webms: false,
	newline_comment: true,
	autoresize_scrolling: true,
	thumbs_scrolling: false,
	per_board_thread_sorting: true,
	webm_controls: true,
	webm_continue: true
};

var board = (function() {
	var board_match = /^\/([^\/]+)\//.exec(window.location.pathname);
	return board_match? board_match[1]: null;
})();

var inThread = window.location.pathname.match(/^\/[^\/]*\/res\//);
var onPage = window.location.pathname.match(/^\/[^\/]*\/([0-9]+|$)/);

var unsafeWindow = window.unsafeWindow || window;

function waitForSelector(selector, callback) {
	var element = document.querySelector(selector);
	if(element) {
		callback(element);
	} else {
		setTimeout(function() { waitForSelector(selector, callback); }, 100);
	}
}

function simulateChange(element) {
	var event = document.createEvent('HTMLEvents');
	event.initEvent('change');
	element.dispatchEvent(event);
}

window.addEventListener('DOMContentLoaded', function(event) {
	if(enableFeatures['autoresize']) {
		// Auto-resize all images on opening a thread in a new tab
		if(inThread) {
			setTimeout(function check_expand() {
				var el1 = document.querySelector('.expand-all-shortcut');
				var el2 = document.querySelector('.contract-all-shortcut');
				if(el1) {
					el1.click();
				} else if(!el2) {
					setTimeout(check_expand, 100);
				}
			}, 0);
		}
	}
	
	if(enableFeatures['preload_images']) {
		var thumbs = document.querySelectorAll('a.fileThumb:not([href$=".webm"])');
		for(var i = 0; i < thumbs.length; i++) {
			var image = new Image();
			image.src = thumbs[i].getAttribute('href');
		}
	}
	
	if(enableFeatures['preload_webms']) {
		var thumbs = document.querySelectorAll('a.fileThumb[href$=".webm"]');
		for(var i = 0; i < thumbs.length; i++) {
			var video = document.createElement('video');
			video.src = thumbs[i].getAttribute('href');
			video.setAttribute('preload', 'auto');
		}
	}
	
	if(enableFeatures['newline_comment']) {
		// Better image resize:
		if(inThread) {
			document.querySelector('.opContainer + .replyContainer').style.clear = 'both';
		}
	}
	
	if(enableFeatures['per_board_thread_sorting']) {
		if(onPage) {
			waitForSelector('#index-sort', function(select) {
				var changed = false;
				var option = GM_getValue('sort-' + board);
				if(option) {
					var shouldSelect = select.querySelector('[value="' + option + '"]');
					if(shouldSelect) {
						shouldSelect.selected = true;
						simulateChange(select);
						changed = true;
					}
				}
				if(!changed) {
					GM_setValue('sort-' + board, select.value);
				}
				select.addEventListener('change', function() {
					GM_setValue('sort-' + board, select.value);
				});
			});
		}
	}
	
	function handleVideoClick(event) {
		var heightOfControls = 50;
		
		if(event.target.videoHeight - heightOfControls < event.layerY) {
			event.stopPropagation();
			event.preventDefault();
		}
	}
	
	if(enableFeatures['webm_controls']) {
		window.addEventListener('DOMNodeInserted', function(event) {
			if(event.target.tagName === 'VIDEO' && event.target.classList.contains('full-image')) {
				event.target.controls = true;
				event.target.addEventListener('click', handleVideoClick, true);
			}
		});
	}
	
	function getFullId(e) {
		if(e === null) {
			return 'Unknown!';
		}
		
		if(e.hasAttribute('data-full-i-d')) {
			return e.getAttribute('data-full-i-d');
		} else {
			return getFullId(e.parentNode);
		}
	}
	
	var currentTimes = {};
	
	function handleVideoTimeUpdate(event) {
		currentTimes[getFullId(event.target)] = event.target.currentTime;
	}
	
	function handleVideoLoadedMetaData(event) {
		var id = getFullId(event.target);
		if(currentTimes.hasOwnProperty(id)) {
			event.target.currentTime = currentTimes[id];
		}
	}
	
	if(enableFeatures['webm_continue']) {
		window.addEventListener('DOMNodeInserted', function(event) {
			var target = event.target;
			if(target.tagName === 'VIDEO') {
				target.addEventListener('timeupdate', handleVideoTimeUpdate);
				target.addEventListener('loadedmetadata', handleVideoLoadedMetaData);
				/*if(target.getAttribute('id') === 'ihover') {
					target.addEventListener('timeupdate', handleVideoTimeUpdate);
				} else if(target.classList.contains('full-image')) {
					var id = target.getAttribute('data-full-i-d');
					if(id in currentTimes) {
						target.addEventListener('loadedmetadata', handleVideoStart);
					}
				}*/
			}
		});
	}
	
	var ignoreEvent = false;
	var mouseoutElement = null;
	var mousePosition = [];
	window.addEventListener('mousemove', function(event) {
		mousePosition = [event.x, event.y];
		if(mouseoutElement && document.elementFromPoint(event.x, event.y) != mouseoutElement) {
			if(ignoreEvent) {
				ignoreEvent = false;
			} else {
				console.log('outed', mouseoutElement);
				var newEvent = new MouseEvent('mouseout');
				mouseoutElement.dispatchEvent(newEvent);
				mouseoutElement = null;
			}
		}
	});
	
	// Better scrolling with space:
	window.addEventListener('keydown', function(event) {
		var isExpanded = document.querySelector('.postContainer.expanded-image');
		if(event.keyCode === 32 && !(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement)) {
			var reverse = event.shiftKey;
			if(isExpanded) {
				if(!enableFeatures['autoresize_scrolling']) {
					return;
				}
				event.preventDefault();
				var images = document.querySelectorAll('img.full-image');
				var length = images.length;
				var currentScroll = window.pageYOffset;
				if(!reverse) {
					for(var i = 0; i < length; i++) {
						if(images[i].y > currentScroll) {
							unsafeWindow.scrollTo(0, images[i].y);
							break;
						}
					}
					if(i === length) { //At last image
						unsafeWindow.scrollTo(0, 999999);
					}
				} else {
					for(var i = length - 1; i >= 0; i--) {
						if(images[i].y < currentScroll) {
							unsafeWindow.scrollTo(0, images[i].y);
							break;
						}
					}
					if(i === -1) { //At first image
						unsafeWindow.scrollTo(0, 0);
					}
				}
			} else {
				if(!enableFeatures['thumbs_scrolling']) {
					return;
				}
				var hover = document.elementFromPoint(mousePosition[0], mousePosition[1]);
				if(hover instanceof HTMLImageElement) {
					event.preventDefault();
					var images = document.querySelectorAll('img:not(.full-image)');
					var length = images.length;
					var index = -1;
					if(!reverse) {
						for(var i = 0; i < length; i++) {
							if(images[i] === hover)
							{
								index = i + 1;
								break;
							}
						}
					} else {
						for(var i = length - 1; i >= 0; i--) {
							if(images[i] === hover) {
								index = i - 1;
								break;
							}
						}
					}
					if(index === length || index === -1) {
						if(!reverse) {
							unsafeWindow.scrollTo(0, 999999);
						} else {
							unsafeWdindow.scrollTo(0, 0);
						}
					} else {
						unsafeWindow.scrollTo(0, images[index].y + images[index].height / 2 - mousePosition[1]);
						
						var newEvent = new MouseEvent('mouseover');
						images[index].dispatchEvent(newEvent);
						mouseoutElement = images[index];
						ignoreEvent = true;
					}
				}
			}
		}
	});
});