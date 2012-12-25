// ==UserScript==
// @name       Chemory hack
// @namespace  http://tyilo.com/
// @version    0.1
// @description  Chemory hack
// @match      http://intranet.odensekatedralskole.dk/~KR/kemi-01/Chemory_lg/chemory.htm
// @copyright  2012+, Tyilo
// ==/UserScript==
var newShowImage = function(but) {
	if(oktoclick){
		oktoclick=false; 
		document.images[('img'+but)].src='C_image'+map[but]+'.gif';
		document.images[('img'+but)].alt='Image '+map[but];
		if(ctr==0){
			ctr++;
			clickarray[0]=but;
			oktoclick=true;
var imgs = document.querySelectorAll('img[name*="img"]');
for(var i = 0; i < imgs.length; i++)
{
imgs[i].style.opacity = '1';
}
var match = 101 - map[but];
for(var i = 0; i < map.length; i++)
{
if(map[i] == match)
{
document.querySelector('img[name="img' + i + '"]').style.opacity = '0.5';
}
}
			}else{
				clickarray[1]=but;
				ctr=0;
				setTimeout('returntoold()', ShowTime);
				}
		}
};
GM_registerMenuCommand('ToggleHack', function()
{
    var tempShowImage = unsafeWindow.showimage;
    unsafeWindow.showimage = newShowImage;
    newShowImage = tempShowImage;
});
