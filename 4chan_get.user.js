// ==UserScript==
// @id             4chan-get@tyilo.com
// @name           4chan GET
// @version        1.0
// @namespace      http://tyilo.com/
// @author         Asger Drewsen <asgerdrewsen@gmail.com>
// @description    Requires 4chan X and its QuickReply
// @include        http://boards.4chan.org/*/*
// @include        https://boards.4chan.org/*/*
// @run-at         document-end
// @require        http://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js
// @grant          GM_xmlhttpRequest
// @updateURL      https://raw.github.com/Tyilo/userscripts/master/4chan_get.user.js
// ==/UserScript==

var board;
var postNumber;
var probing = false;

function enableButton()
{
    $('#getbutton').text('GO');
	$('#getfieldset').prop('disabled', false);
}

function probe()
{
	if(!probing)
	{
		return;
	}
	postStatus(postNumber, function(posted)
	{
		if(!probing)
		{
			return;
		}
		if(posted)
		{
			probing = false;
			
			var form = document.querySelector('#qr form');
			var submitEvent = document.createEvent('Event');
			submitEvent.initEvent('submit', true, true);
			form.dispatchEvent(submitEvent);
			
			enableButton();
		}
		else
		{
			probe();
		}
	});
}

function startCheck(event)
{
	event.preventDefault();
	$('#getbutton').text('Loading...');
	$('#getfieldset').prop('disabled', true);
	
	postNumber = Number($('#getnum').val()) - Number($('#getbefore').val());
	probes = Number($('#getprobes').val());
	
	postStatus(postNumber, function(posted)
	{
		if(posted)
		{
			alert('Post has already been posted, slowpoke!');
			enableButton();
		}
		else
		{
			probing = true;
			for(var i = 0; i < probes; i++)
			{
				setTimeout(probe, 0);
			}
		}
	});
}

function postStatus(number, callback)
{
	GM_xmlhttpRequest({
		method: 'HEAD',
		url: 'https://sys.4chan.org/' + board + '/imgboard.php?res=' + number,
		onload: function(response)
		{
			switch(response.status)
			{
				case 200:
					if(response.responseHeaders === '') // Chrome bug
					{
						callback(false);
					}
					else
					{
						callback(true);
					}
					break;
				case 404:
					callback(false);
					break;
				case 410:
					callback(true);
					break;
				default:
					callback(false);
			}
		},
		onerror: function(response)
		{
			callback(false);
		}
	});
}

$(function()
{
	board = window.location.pathname.split('/')[1];
});

document.addEventListener('DOMNodeInserted', function(event)
{
	var target = $(event.target);
	if(target.attr('id') === 'qr')
	{
		var form = $('<form><fieldset id="getfieldset" style="border: none; margin: 0; padding: 0;">GET: <input type="number" id="getnum"> <button type="submit" id="getbutton">GO</button><br>When number of posts before appears: <input type="number" id="getbefore" value="2" size="2"><br>Probes: <input type="number" id="getprobes" value="1" size="2"></fieldset></form>').submit(startCheck);
		target.append(form);
	}
});
