// ==UserScript==
// @id             wealth-evaluator@tyilo.com
// @name           Wealth Evaluator
// @version        1.1.2
// @namespace      http://tyilo.com/
// @author         Asger Drewsen <asgerdrewsen@gmail.com>
// @description    Calculates the GE value of your bank
// @include        https://secure.runescape.com/m=world*/a=*/html5/comapp/comapp.ws*
// @include        https://secure.runescape.com/m=world*/a=*/html5/comapp/*
// @run-at         document-end
// @updateURL      https://raw.github.com/Tyilo/userscripts/master/wealth-evaluator.user.js
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
var xsMethod = 0;

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
            if(data.count > 0) {
                return JSON.parse(data.query.results.html.body.p);
            } else {
                return null;
            }
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

function isBankTab() {
    return !!window.location.pathname.match(/\/comapp\/bank/);
}

loadjQuery(function($) {
    var origPushState = window.history.pushState;
    window.history.pushState = function() {
        var wasBank = isBankTab();
        
        var returnValue = origPushState.apply(window.history, arguments);
        
        var isBank = isBankTab();
        
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
           });
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
        var priceOverrides = {
            // Coins
            995: 1
        };
        
        if(itemID in priceOverrides) {
            callback(priceOverrides[itemID]);
            return;
        }
        
        var itemSubstitutions = [
            // Pernix, Torva, Virtus: helm, body & legs + Zaryte bow
            {
                items: 10,
                degradedPerItem: 2,
                degradedSpace: 4,
                tradeableSpace: 4,
                degradedIDBase: 20137,
                tradeableIDBase: 20135
            },
            // Pernix, Torva, Virtus: gloves & boots
            {
                items: 6,
                degradedPerItem: 3,
                degradedSpace: 3,
                tradeableSpace: 2,
                degradedIDBase: 24974,
                tradeableIDBase: 25058
            },
            // Drygores
            {
                items: 6,
                degradedPerItem: 2,
                degradedSpace: 4,
                tradeableSpace: 4,
                degradedIDBase: 26581,
                tradeableIDBase: 26579
            },
            // Ascension crossbow & off-hand
            {
                items: 2,
                degradedPerItem: 2,
                degradedSpace: 4,
                trabeableSpace: 4,
                degradedIDBase: 28439,
                tradeableIDBase: 28437
            },
            // Seismic wand & off-hand
            {
                items: 2,
                degradedPerItem: 2,
                degradedSpace: 4,
                trabeableSpace: 4,
                degradedIDBase: 28619,
                tradeableIDBase: 28617
            },
            // Malevolent, Vengeful, Merciless: kiteshield
            {
                items: 3,
                degradedPerItem: 2,
                degradedSpace: 4,
                tradeableSpace: 4,
                degradedIDBase: 30007,
                tradeableIDBase: 30005
            },
            // Virtus wand
            {
                items: 1,
                degradedPerItem: 2,
                degradedSpace: 1,
                tradeableSpace: 1,
                degradedIDBase: 30493,
                tradeableIDBase: 25654
            },
            // Virtus book
            {
                items: 1,
                degradedPerItem: 2,
                degradedSpace: 1,
                tradeableSpace: 1,
                degradedIDBase: 30495,
                tradeableIDBase: 25664 
            }
        ];
        
        for(var i = 0; i < itemSubstitutions.length; i++) {
            var sub = itemSubstitutions[i];
            var diff = itemID - sub.degradedIDBase;
            var maxDiff = sub.degradedSpace * (sub.items - 1) + (sub.degradedPerItem - 1);
            
            if(diff < 0 || diff > maxDiff) {
                continue;
            }
            
            if(diff % sub.degradedSpace < sub.degradedPerItem) {
                var num = Math.floor(diff / sub.degradedSpace);
                
                itemID = sub.tradeableIDBase + sub.tradeableSpace * num;
                
                break;
            }
        }
        
        function errorHandler() {
            // retry
            setTimeout(function() {
                getPrice(itemID, callback);
            }, 100 + Math.random() * 200);
        }
        
        var geURLprefix = 'http://services.runescape.com/m=itemdb_rs/api/graph/';
        $.ajax({
            dataType: 'json',
            url: xsURL(geURLprefix + itemID + '.json'),
            success: function(data) {
                try {
                    data = xsExtract(data);
                } catch(e) {
                    data = null;
                }
                if(!data) {
                    errorHandler();
                    return;
                }
                
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
                
                errorHandler();
            }
        });
    }
});

