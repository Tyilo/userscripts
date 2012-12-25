// ==UserScript==
// @id             4chancombo@tyilo.com
// @name           4chan Combo
// @version        1.4.1
// @namespace      
// @author         Tyilo
// @description    
// @include        http://boards.4chan.org/*/*
// @run-at         document-start
// @updateURL      http://tyilo.com/userscripts/4chancombo.user.js
// ==/UserScript==
/*function bufferToString( buf )
{
    var view = new Uint8Array( buf );
    return Array.prototype.join.call(view, "");
}
function createMultipart(callback, url, fields, fileFields, files, boundary)
{
    if(!boundary)
    {
        boundary = 'javascript-createMultipart';
    }
    var body = '';
    if(fields)
    {
        for(var key in fields)
        {
            if(fields.hasOwnProperty(key))
            {
                body += '--' + boundary + '\n';
                body += 'Content-Disposition: form-data; name="' + key + '"\n';
                body += '\n';
                body += fields[key] + '\n';
            }
        }
    }
    if(files)
    {
        addFiles(fileFields, files);
    }
    else
    {
        send();
    }
    function addFiles(fileFields, files)
    {
        var reader = new FileReader();
        reader.addEventListener('loadend', function()
        {
            body += '--' + boundary + '\n';
            body += 'Content-Disposition: form-data; name="' + fileFields[0] + '"; filename="' + files[0].name +'"\n';
            body += 'Content-Type: ' + (files[0].type? files[0].type: 'application/octet-stream') + '\n';
            body += '\n';
            body += bufferToString(reader.result) + '\n';
            if(fileFields.length > 1)
            {
                fileFields.shift();
            }
            files.shift();
            if(files.length > 0)
            {
                addFiles(fileFields, files);
            }
            else
            {
                send();
            }
        });
        //reader.readAsBinaryString(files[0]);
        //reader.readAsText(files[0]);
        reader.readAsArrayBuffer(files[0]);
    }
    function send()
    {
        body += '--' + boundary + '\n';
        var xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        xhr.setRequestHeader('Content-Type', 'multipart/form-data, boundary=' + boundary);
        xhr.addEventListener('loadend', function(response)
        {
            callback(xhr, response);
        });
        xhr.send(body);
    }
}

function createMultipartForm(callback, url, form, boundary)
{
    var fieldInputs = form.querySelectorAll('input[name]:not([type="file"])');
    var fields = {};
    for(var i = 0; i < fieldInputs.length; i++)
    {
        var value = fieldInputs[i].value;
        fields[fieldInputs[i].name] = value? value: '';
    }
    var fileInputs = form.querySelectorAll('input[name][type="file"]');
    var fileFields = [];
    var files = [];
    for(var i = 0; i < fileInputs.length; i++)
    {
        var fileList = fileInputs[i].files;
        for(var j = 0; j < fileList.length; j++)
        {
            fileFields.push(fileInputs[i].name);
            files.push(fileList[j]);
        }
    }
    createMultipart(callback, url, fields, fileFields, files, boundary);
}*/
document.addEventListener('DOMContentLoaded', function()
{
	var board, overlay, container, content, closeLink, thread, fieldNames, formNames, fields, uploads, captchaContainer, captchas, captchaInputs, captchaIds, autodelete, go, comboLink, text, firstPostTime, firstPostPassword;
	
	var postarea = document.getElementsByClassName('postarea')[0];
	
	var warning, warningTextContainer, warningText, hideButton, buttonLabel;
	
	var hidden = false;
	
	function hide()
	{
		localStorage['4chancombo-hidewarning'] = '1';
		warningTextContainer.style.display = 'none';
		hidden = true;
		buttonLabel.nodeValue = 'Show warning';
	}
	function show()
	{
		delete localStorage['4chancombo-hidewarning'];
		warningTextContainer.style.display = 'block';
		hidden = false;
		buttonLabel.nodeValue = 'Hide warning';
	}
	
	if(typeof unsafeWindow === 'undefined')
	{
		window.unsafeWindow = window;
	}
	if(typeof GM_xmlhttpRequest === 'undefined')
	{
		warning = document.createElement('div');
		warning.style.position = 'relative';
		
		warningTextContainer = document.createElement('div');
		warningTextContainer.style.whiteSpace = 'pre';
		warningTextContainer.style.color = 'red';
		warningTextContainer.style.fontSize = '14px';
		warningTextContainer.style.padding = '10px';
		warningTextContainer.style.marginBottom = '10px';
		warningTextContainer.style.backgroundColor = getComputedStyle(document.getElementsByClassName('reply')[0]).backgroundColor;
		
		warningText = document.createTextNode('');
		warningText.nodeValue += 'Your user script engine does not support GM_xmlhttpRequest, which is required to run 4chan Combo...\n\n';
		warningText.nodeValue += 'Please remove this script and get a supported user script engine and install it there.\n\n';
		warningText.nodeValue += 'Currently known supported engines:\n';
		warningText.nodeValue += '- Scriptish (Firefox).';
		
		warningTextContainer.appendChild(warningText);
		
		warning.appendChild(warningTextContainer);
		
		hideButton = document.createElement('button');
		hideButton.style.position = 'absolute';
		hideButton.style.right = '5px';
		hideButton.style.top = '5px';
		hideButton.addEventListener('click', function()
		{
			if(hidden)
			{
				show();
			}
			else
			{
				hide();
			}
		});
		
		buttonLabel = document.createTextNode('Hide warning');
		
		hideButton.appendChild(buttonLabel);
		
		if(localStorage['4chancombo-hidewarning'])
		{
			hide();
		}
		
		warning.appendChild(hideButton);
		postarea.insertBefore(warning, postarea.firstChild);
	}
	
	function capitalize(string)
	{
		return string.charAt(0).toUpperCase() + string.slice(1);
	}
	function createField(name, element, defaultValue)
	{
		var div = document.createElement('div');
		div.style.marginBottom = '10px';
		div.appendChild(document.createTextNode(name));
		element.style.cssFloat = 'right';
		element.style.marginRight = '115px';
		element.style.width = '125px';
		element.value = defaultValue? defaultValue: '';
		div.appendChild(element);
		return div;
	}
	function getCaptcha(num)
	{
		if(typeof num === 'undefined')
		{
			num = captchas.length;
		}
		var main_captcha = document.getElementById('recaptcha_image').firstChild;
		var captcha;
		if(!captchas[num])
		{
			captcha = main_captcha.cloneNode(true);
			captcha.style.cursor = 'pointer';
			(function(num)
			{
				captcha.addEventListener('click', function()
				{
					getCaptcha(num);
				});
			})(num);
			captchaContainer.appendChild(captcha);
			captchas[num] = captcha;
		}
		else
		{
			captchas[num].src = main_captcha.src;
			captcha = captchas[num];
		}
		if(!captchaInputs[num])
		{
			var captchaInput = document.createElement('input');
			captchaInput.type = 'text';
			captchaContainer.appendChild(captchaInput);
			captchaInputs[num] = captchaInput;
		}
		else
		{
			captchaInputs[num].value = '';
		}
		captchaIds[num] = document.getElementById('recaptcha_challenge_field').value;
		
		unsafeWindow.Recaptcha.reload();
		
		if(captchas.length < 3)
		{
			var lastSource = captcha.src;
			var intervalId = setInterval(function()
			{
				var newCaptcha = document.getElementById('recaptcha_image');
				if(newCaptcha && newCaptcha.firstChild && newCaptcha.firstChild.src && newCaptcha.firstChild.src !== lastSource)
				{
					clearInterval(intervalId);
					getCaptcha();
				}
			}, 0);
		}
	}
	function getURL(threadId)
	{
		return window.location.protocol + '//' + window.location.host + board + 'res/' + threadId;
	}
	function getLink(before, threadId, after)
	{
		var container = document.createElement('span');
		container.appendChild(document.createTextNode(before));
		var link = document.createElement('a');
		link.href = getURL(threadId);
		link.target = '_blank';
		link.appendChild(document.createTextNode(threadId));
		container.appendChild(link);
		if(after)
		{
			container.appendChild(document.createTextNode(after));
		}
		return container;
	}
	function check(callback, response, successText, alwaysEnable)
	{
		var error = /<font color=red size=5 style=""><b>(?:<a.*?>)?(.*?)(?:<\/a.*?>)?<br>/.exec(response.responseText || '');
		console.log(error);
		console.log(response);
		if(response.status !== 200 || error)
		{
			if(error)
			{
				text.appendChild(document.createTextNode('\n' + error[1]));
			}
			else
			{
				text.appendChild(document.createTextNode('\nError: ' + response.statusText));
			}
			content.disabled = false;
			response = 'error';
		}
		else
		{
			if(typeof successText === 'string')
			{
				successText = document.createTextNode(successText);
			}
			text.appendChild(successText);
			if(alwaysEnable)
			{
				content.disabled = false;
			}
		}
		if(callback)
		{
			callback(response);
		}
	}
	function cooldown(callback, seconds)
	{
		var intervalId;
		
		var cooldownText = document.createTextNode('');
		
		function tick()
		{
			cooldownText.nodeValue = '\nWaiting for cooldown: ' + seconds;
			if(seconds <= 0)
			{
				clearInterval(intervalId);
				callback();
			}
			else
			{
				seconds--;
			}
		}
		
		text.appendChild(cooldownText);
		intervalId = setInterval(tick, 1000);
	}
	function deletePost(id, password)
	{
		function go()
		{
			function beforeCheck(response)
			{
				check(null, response, getLink('\nDeleted post successfully: ', id), true);
			}
			GM_xmlhttpRequest(
			{
				method: 'POST',
				url: 'http://sys.4chan.org' + board + 'post', //document.getElementsByName('delform')[0].getAttribute('action'),
				headers:
				{
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				data: id + '=delete&mode=usrdel&pwd=' + password,
				onload: beforeCheck,
				onerror: beforeCheck
			});
		}
		
		text.appendChild(getLink('\nDeleting ', id, '...'));
		
		var timeRemaining = 30 - Math.ceil(((new Date()).getTime() - firstPostTime) / 1000);
		if(timeRemaining > 0)
		{
			cooldown(go, timeRemaining);
		}
		else
		{
			go();
		}
	}
	function post(num, callback, threadId, shouldCooldown)
	{
		var formData = new FormData();
		
		function beforeCheck(response)
		{
			check(function(response)
			{
				getCaptcha(num);
				if(response !== 'error')
				{
					callback(response);
				}
				else if(threadId && autodelete.checked)
				{
					deletePost(threadId, firstPostPassword);
				}
			}, response, '\nDone: ' + (num + 1));
		}
		function go()
		{	
			text.appendChild(document.createTextNode('\nPosting: ' + (num + 1)));
			//var formData = new FormData(form);
			var headers = {};
			if(threadId)
			{
				formData.append('resto', threadId);
				headers.Referer = getURL(threadId);
			}
			GM_xmlhttpRequest(
			{
				method: 'POST',
				url: postarea.querySelector('form[name="post"]').getAttribute('action'),
				onload: beforeCheck,
				onerror: beforeCheck,
				headers: headers,
				data: formData
			});
		}
		
		/*var form = document.getElementsByName('post')[0].cloneNode(true);
		form.querySelector('[name="name"]').value = fields.name.value;
		form.querySelector('[name="email"]').value = fields.email.value;
		form.querySelector('[name="sub"]').value = fields.subject.value;
		form.querySelector('[name="recaptcha_challenge_field"]').value = captchaIds[num];
		form.querySelector('[name="recaptcha_response_field"]').value = captchaInputs[num].value;*/
		
		/*var newUpload = uploads[num].cloneNode(true);
		uploads[num].parentNode.replaceChild(newUpload, uploads[num]);
		
		var uploadForm = document.createElement('form');
		uploadForm.appendChild(uploads[num]);*/
		
		//formData = new FormData(uploadForm);
		
		if(uploads[num].files.length >= 1)
		{
			formData.append('upfile', uploads[num].files[0]);
		}
		
		/*var oldUpload = form.querySelector('[name="upfile"]');
		oldUpload.parentNode.removeChild(oldUpload);
		form.appendChild(uploads[num]);*/
		
		//uploads[num] = newUpload;
		
		for(var i = 0; i < fieldNames.length; i++)
		{
			formData.append(formNames[i], fields[fieldNames[i]].value);
		}
		
		formData.append('pwd', firstPostPassword);
		
		formData.append('recaptcha_challenge_field', captchaIds[num]);
		formData.append('recaptcha_response_field', captchaInputs[num].value);
		
		formData.append('mode', 'regist');
		
		if(shouldCooldown)
		{
			cooldown(go, 30);
		}
		else
		{
			go();
		}
	}
	function close(e)
	{
		if(e.target === container || e.target === closeLink)
		{
			overlay.style.display = 'none';
			e.preventDefault();
		}
	}
	
	board = /^\/([^\/]*)\//.exec(window.location.pathname)[0];
	
	overlay = document.createElement('div');
	overlay.style.display = 'none';
	overlay.style.position = 'fixed';
	overlay.style.zIndex = '99';
	overlay.style.left = '0';
	overlay.style.top = '0';
	overlay.style.width = '100%';
	overlay.style.height = '100%';
	overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
	
	container = document.createElement('div');
	container.style.display = 'table-cell';
	container.style.verticalAlign = 'middle';
	container.addEventListener('click', close);
	
	content = document.createElement('fieldset');
	content.style.position = 'relative';
	content.style.margin = 'auto';
	content.style.width = '300px';
	content.style.padding = '10px';
	content.style.backgroundColor = document.body.getAttribute('bgcolor');
	content.appendChild(document.createElement('br'));
	
	closeLink = document.createElement('a');
	closeLink.href = '#';
	closeLink.appendChild(document.createTextNode('[close]'));
	closeLink.style.position = 'absolute';
	closeLink.style.right = '0';
	closeLink.style.top = '0';
	closeLink.addEventListener('click', close);
	
	content.appendChild(document.createTextNode('Thread # to post in (blank = new): '));
	
	thread = document.createElement('input');
	thread.type = 'text';
	thread.style.width = '80px';
	thread.value = window.location.pathname.match(/[0-9]*$/);
	
	content.appendChild(thread);
	
	fieldNames = ['name', 'email', 'subject'];
	formNames = ['name', 'email', 'sub'];
	fields = {};
	for(var i = 0; i < fieldNames.length; i++)
	{
		var field = document.createElement('input');
		field.type = 'text';
		content.appendChild(createField(capitalize(fieldNames[i]) + ':', field, document.getElementsByName(formNames[i])[0].value));
		fields[fieldNames[i]] = field;
	}
	
	uploads = [];
	for(var i = 1; i <= 3; i++)
	{
		var upload = document.createElement('input');
		upload.type = 'file';
		upload.name = 'upfile';
		content.appendChild(createField('Image ' + i + ':', upload));
		uploads.push(upload);
	}
	
	captchaContainer = document.createElement('div');
	captchas = [];
	captchaInputs = [];
	captchaIds = [];
	
	getCaptcha();
	
	content.appendChild(captchaContainer);
	
	content.appendChild(document.createElement('br'));
	
	content.appendChild(document.createTextNode('Auto-delete thread on error: '));
	
	autodelete = document.createElement('input');
	autodelete.type = 'checkbox';
	content.appendChild(autodelete);
	
	content.appendChild(document.createElement('br'));
	content.appendChild(document.createElement('br'));
	
	go = document.createElement('button');
	go.style.textAlign = 'center';
	go.appendChild(document.createTextNode('GO'));
	go.addEventListener('click', function()
	{
		var posts = 3; //To be changed...
		
		var postNum = 0;
		
		var threadId = thread.value;
		
		function callback(response)
		{
			if(postNum === 0)
			{
				firstPostTime = (new Date()).getTime();
				firstPostPassword = postarea.querySelectorAll('[name="pwd"]').value ;
			}
			postNum++;
			var shouldCooldown = false;
			if(postNum >= 2 || (postNum == 1 && threadId))
			{
				shouldCooldown = true;
			}
			if(!threadId)
			{
				threadId = /thread:0,no:([0-9]*)/.exec(response.responseText)[1];
				text.appendChild(getLink('\nThread ID: ', threadId));
			}
			if(postNum === posts)
			{
				text.appendChild(document.createTextNode('\nRedirecting to thread...'));
				window.location.href = getURL(threadId);
			}
			else
			{
				post(postNum, callback, threadId, shouldCooldown);
			}
		}
		
		content.disabled = true;
		text.textContent = 'Posting...';
		//var formTemplate = document.getElementsByName('post')[0];
		
		post(0, callback, threadId, false);
		
		/*post(0, function(response)
		{
			firstPostTime = (new Date()).getTime();
			var threadId = /thread:0,no:([0-9]*)/.exec(response.responseText)[1];
			text.appendChild(getLink('\nThread ID: ', threadId));
			post(1, function(response)
			{
				post(2, function(response)
				{
					text.appendChild(document.createTextNode('\nRedirecting to thread...'));
					window.location.href = getURL(threadId);
				}, threadId);
			}, threadId);
		}, thread.value);*/
	});
	content.appendChild(go);
	
	text = document.createElement('div');
	text.style.whiteSpace = 'pre';
	content.appendChild(text);
	
	content.appendChild(closeLink);
	container.appendChild(content);
	overlay.appendChild(container);
	document.body.appendChild(overlay);
	
	comboLink = document.createElement('a');
	comboLink.href = '#';
	comboLink.appendChild(document.createTextNode('[combo :DDDDD]'));
	comboLink.style.fontSize = '30px';
	comboLink.style.display = 'inline-block';
	comboLink.style.marginBottom = '10px';
	comboLink.addEventListener('click', function(event)
	{
		overlay.style.display = 'table';
		event.preventDefault();
	});
	postarea.insertBefore(comboLink, postarea.firstChild);
});
