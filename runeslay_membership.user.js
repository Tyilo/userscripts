// ==UserScript==
// @id             runeslaymembershiphelper@tyilo
// @name           RuneSlay Membership Helper
// @version        1.0
// @namespace      http://tyilo.com/
// @author         Tyilo
// @description    Auto-tries all possibilities with runeslay membership codes
// @include        https://secure.runescape.com/m=billing_core/*/voucherform.ws*
// @include        https://secure.runescape.com/m=billing_core/*/voucherredeem.ws*
// @require        https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js
// @run-at         document-start
// ==/UserScript==

var unknownCharacterPattern = new RegExp(encodeURIComponent('?'), 'g');

$(function()
{
    var $form = $('form');
    var $submitButton = $('button[type="submit"]');
    
    $form.submit(function(e)
    {      
        var loadErrors = 0;
        var inputErrors = 0;
        var successes = 0;
        var total = 0;
        var correctCodes = [];
        
        var serialized = $form.serialize();
        var unknowns = serialized.match(unknownCharacterPattern);
        
        if(unknowns)
        {
            e.preventDefault();
            
            var possibilities = Math.pow(10, unknowns.length);
            
            $submitButton.attr('disabled', true);
            var $status = $('<div>').insertAfter('#voucherCode').text('Loading: 0/' + possibilities).css('white-space', 'pre-line');
            
            var loaded = function(xhr, status, request)
            {
                setTimeout(function()
                {
                    if(status === 'success')
                    {
                        var $response = $(xhr.responseText);
                        if($response.find('.bad').length === 0)
                        {
                            successes++;
                            correctCodes.push(decodeURIComponent(/(?:^|\?)voucherCode=([^&#]*)/.exec(request.data)[1]));
                        }
                        else
                        {
                            inputErrors++;
                        }
                    }
                    else
                    {
                        loadErrors++;
                    }
                    
                    total++;
                    $status.text('Loading: ' + total + '/' + possibilities + '\nSuccesses: ' + successes + ((correctCodes.length > 0)? '(' + correctCodes.join(', ') + ')': '') + '\nInput errors: ' + inputErrors + '\nLoad errors: ' + loadErrors);
                    
                    if(total === possibilities)
                    {
                        $status.append('\nDone.');
                        $submitButton = $('button[type="submit"]').attr('disabled', false);
                    }
                }, 0);
            }
            
            for(var i = 0; i < possibilities; i++)
            {
                var replacements = 0;
                $.ajax(
                {
                    url: $form.attr('action'),
                    type: $form.attr('method'),
                    data: $form.serialize().replace(unknownCharacterPattern, function()
                    {
                        var digit = Math.floor(i / (Math.pow(10, replacements)) % 10);
                        replacements++;
                        return digit;
                    }),
                    complete: function(xhr, status)
                    {
                        loaded(xhr, status, this);
                    }
                });
            }
        }
    });
});
