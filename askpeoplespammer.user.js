// ==UserScript==
// @id             askpeoplespammer@tyilo.com
// @name           AskPeople.dk spammer
// @version        1.0
// @namespace      
// @author         Tyilo
// @description    
// @include        *://www.askpeople.dk/ask/real/scheme.php*
// @run-at         document-start
// @updateURL      http://tyilo.com/userscripts/askpeoplespammer.user.js
// ==/UserScript==
document.addEventListener('DOMContentLoaded', function()
{
	var container, requests, button, buttonLabel, successOutput, failOutput;
	
	var number, successes, fails;
	
	function enableButton()
	{
		if(number == successes + fails)
		{
			buttonLabel.nodeValue = 'Send';
			button.disabled = false;
		}
	}
	
	function success()
	{
		successes++;
		successOutput.nodeValue = 'Successes: ' + successes;
		
		enableButton();
	}
	
	function fail()
	{
		fails++;
		failOutput.nodeValue = 'Fails: ' + fails;
		
		enableButton();
	}
	
	function click()
	{
		number = Number(requests.value);
		successes = 0;
		fails = 0;
		
		button.disabled = true;
		buttonLabel.nodeValue = 'Sending...';
		
		var formData = new FormData(document.getElementById('answerform'));
		
		for(var i = 0; i < number; i++)
		{
			(function()
			{
				var xhr = new XMLHttpRequest();
				xhr.open('GET', window.location.href);
				xhr.addEventListener('load', function()
				{
					var match = /action='([^']*)'/.exec(xhr.responseText);
					if(match)
					{
						var xhr2 = new XMLHttpRequest();
						xhr2.open('POST', match[1]);
						xhr2.addEventListener('load', function()
						{
							success();
						});
						xhr2.addEventListener('error', fail);
						xhr2.send(formData);
					}
				});
				xhr.addEventListener('error', fail);
				xhr.send();
			})();
		}
	}
	
	container = document.createElement('div');
	container.style.textAlign = 'center';
	
	container.appendChild(document.createTextNode('Request to send: '));
	requests = document.createElement('input');
	requests.type = 'number';
	container.appendChild(requests);
	
	button = document.createElement('button');
	button.addEventListener('click', click);
	
	buttonLabel = document.createTextNode('Send');
	
	button.appendChild(buttonLabel);
	container.appendChild(button);
	
	container.appendChild(document.createElement('br'));
	
	successOutput = document.createTextNode('');
	container.appendChild(successOutput);
	
	container.appendChild(document.createElement('br'));
	
	failOutput = document.createTextNode('');
	container.appendChild(failOutput);
	
	document.body.appendChild(container);
});
