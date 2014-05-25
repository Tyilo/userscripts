// ==UserScript==
// @id             wealth-evaluator@tyilo.com
// @name           Wealth Evaluator
// @version        1.0
// @namespace      http://tyilo.com/
// @author         Asger Drewsen <asgerdrewsen@gmail.com>
// @description    Calculates the GE value of your bank
// @include        https://secure.runescape.com/m=world*/a=*/html5/comapp/comapp.ws*
// @run-at         document-end
// @updateURL      https://raw.github.com/Tyilo/userscripts/master/wealth-evaluator.js
// ==/UserScript==
function loadScript(src, callback) {
    var s = document.createElement('script');
    s.setAttribute('src', src);
    if(callback) {
        s.addEventListener('load', callback);
    }
    document.body.appendChild(s);
}

function loadjQuery(callback) {
    if(window.jQuery) {
        window.jQuery(callback);
        return;
    }
    
    loadScript('//ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js', function() {
        jQuery.noConflict();
        jQuery(callback);
    });
}

// 0 = cors-anywhere (CORS)
// 1 = allow-any-origin (CORS)
// 2 = whateverorigin clone (JSONP)
// 3 = Yahoo YQL (CORS)
var xsMethod = 1;

function xsURL(url) {
    switch(xsMethod) {
        case 0:
            return 'https://cors-anywhere.herokuapp.com/' + url;
        case 1:
            return 'https://allow-any-origin.appspot.com/' + url;
        case 2:
            return 'https://whateverorigin.herokuapp.com/get?url=' + encodeURIComponent(url) + '&callback=?';
        case 3:
            return 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%20%3D%20"' + encodeURIComponent(url) + '"%20and%20xpath%3D"*"&format=json&_maxage=900';
    }
}

function xsExtract(data) {
    switch(xsMethod) {
        case 0:
            return data;
        case 1:
            return data;
        case 2:
            return JSON.parse(data.contents);
        case 3:
            return JSON.parse(data.query.results.html.body.p);
    }
}

function addCommas(num) {
    return Number(num).toLocaleString('en');
}

function displayNumber(num) {
    var suffixes = ['K', 'M', 'B'];
    
    var str = num.toString();
    
    var log10 = str.length;
    var suffixIndex = Math.floor((log10 - 2) / 3) - 1;
    
    if(suffixIndex >= suffixes.length) {
        throw Error('Too large number!');
    }
    
    var digits;
    var suffix;
    if(suffixIndex < 0) {
        suffix = '';
        digits = log10;
    } else {
        suffix = suffixes[suffixIndex];
        digits = (log10 - 2) % 3 + 2;
    }
    
    var prefix = str.substring(0, digits);
    prefix = addCommas(prefix);
    
    return prefix + suffix;
}

loadjQuery(function($) {
    var origPushState = window.history.pushState;
    window.history.pushState = function() {
        var wasBank = window.location.hash.indexOf('#/bank') === 0;
        
        var returnValue = origPushState.apply(window.history, arguments);
        
        var isBank = window.location.hash.indexOf('#/bank') === 0;
        
        if(wasBank && !isBank) {
            deinit();
        }
        if(!wasBank && isBank) {
            init();
        }
        
        return returnValue;
    };
    
    var valueContainter = null;
    var progressBar = null;
    var intervalID = null;
    
    var totalValue = 0;
    var numItems = 0;
    var items = {};
    var loadingPrices = false;
    
    function init() {
        window.addEventListener('wheel', checkNewItems);
        intervalID = setInterval(checkNewItems, 100);
        
        valueContainter = $('<div>')
            .text('Loading...')
            .css({position: 'absolute', top: '10px', right: '10px', zIndex: '1000', fontSize: '20px'})
            .appendTo(document.body);
        progressBar = $('<progress>')
            .hide()
            .css({position: 'absolute', top: '10px', right: '210px', width: '150px', zIndex: '1000', fontSize: '20px'})
            .appendTo(document.body);
        
        if(totalValue !== 0) {
            updateValue();
        }
        
        checkNewItems();
    }
    
    function deinit() {
        window.removeEventListener('wheel', checkNewItems);
        if(intervalID !== null) {
            clearInterval(intervalID);
        }
        
        if(valueContainter) {
            valueContainter.remove();
        }
        if(progressBar) {
            progressBar.remove();
        }
    }
    
    function checkNewItems() {
        if(loadingPrices) {
            return;
        }
        loadingPrices = true;
        
        var itemImages = $('[displays-bank-item] > img');
        
        var numNewItems = 0;
        var newItems = {};
        
        itemImages.each(function() {
            var src = this.getAttribute('src');
            if(!src) {
                console.log(';^(');
                setTimeout(checkNewItems, 100);
                return;
            }
            var match = src.match(/id=([0-9]*)&count=([0-9]*)/);

            var id = Number(match[1]);
            var obj = {
                element: this.parentNode,
                amount: Number(match[2]),
                price: null
            };
            var oldObj = items[id];
            
            if(oldObj) {
                oldObj.element = obj.element;
                
                if($(oldObj.element).find('.priceTag').length === 0) {
                    if(oldObj.price !== null) {
                        addPriceTag(oldObj);
                    }
                }
            } else {
                newItems[id] = obj;
                items[id] = obj;
                
                numNewItems++;
                numItems++;
            }
        });
        
        updateProgress(numNewItems);
        
        if(numNewItems === 0) {
            loadingPrices = false;
            return;
        }
        
        var i = 0;
        $.each(newItems, function(id, item) {
            getPrice(id, function(price) {
                item.price = price;
                
                addPriceTag(item);

                totalValue += price * item.amount;
                i++;
                
                updateValue();
                updateProgress(numNewItems - i);

                if(i === numNewItems) {
                    loadingPrices = false;
                }
           })
        });
    }
    
    function updateValue() {
        valueContainter.text(addCommas(totalValue));
    }
    
    function updateProgress(unloadedItems) {
        var value = numItems - unloadedItems;
        progressBar.attr({max: numItems, value: value});
        
        if(unloadedItems === 0) {
            progressBar.hide();
        } else {
            progressBar.show();
        }
    }
    
    function addPriceTag(item) {
        $('<span>')
            .attr('class', 'priceTag')
            .text(displayNumber(item.price))
            .css({position: 'absolute', 'top': '5px', right: '5px', color: item.price === 0? 'gray' :'yellow'})
            .appendTo(item.element);
    }
    
    function getPrice(itemID, callback) {
        var geURLprefix = 'http://services.runescape.com/m=itemdb_rs/api/graph/';
        $.ajax({
            dataType: 'json',
            url: xsURL(geURLprefix + itemID + '.json'),
            success: function(data) {
                data = xsExtract(data);
                
                var priceList = data.daily;
                var newestTimestamp = -1;
                for(var k in priceList) {
                    newestTimestamp = Math.max(newestTimestamp, Number(k));
                }
                var price = priceList[newestTimestamp];
                callback(price);
            },
            error: function(jqXHR, status, error) {
                if(error === 'Not Found') {
                    callback(0);
                    return;
                }
                
                // retry
                setTimeout(function() {
                    getPrice(itemID, callback);
                }, 100 + Math.random() * 200);
            }
        });
    }
});

