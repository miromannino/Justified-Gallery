/* 
Justified Gallery
Version: 1.0
Author: Miro Mannino
Author URI: http://miromannino.it

Copyright 2012 Miro Mannino (miro.mannino@gmail.com)

This file is part of Justified Gallery.

This work is licensed under the Creative Commons Attribution 3.0 Unported License. 

To view a copy of this license, visit http://creativecommons.org/licenses/by/3.0/ 
or send a letter to Creative Commons, 444 Castro Street, Suite 900, Mountain View, California, 94041, USA.
*/

__justifiedGallery_galleryID=0;
(function(d){d.fn.justifiedGallery=function(l){function m(b,f,j,c){var a,g=0,h;for(a=0;a<b.length;a++){b[a].nh=Math.ceil(f[b[a].indx].height*((f[b[a].indx].width+j)/f[b[a].indx].width));b[a].nw=f[b[a].indx].width+j;var d=b[a],e=b[a].nw,i=b[a].nh,k=void 0,k=e>i?e:i;d.suffix=100>=k?c.sizeSuffixes.lt100:240>=k?c.sizeSuffixes.lt240:320>=k?c.sizeSuffixes.lt320:500>=k?c.sizeSuffixes.lt500:640>=k?c.sizeSuffixes.lt640:c.sizeSuffixes.lt1024;b[a].l=g;c.fixedHeight||(0==a?h=b[a].nh:h>b[a].nh&&(h=b[a].nh));g+=
b[a].nw+c.margins}c.fixedHeight&&(h=c.rowHeight);j="";for(a=0;a<b.length;a++)g=f[b[a].indx],d=b[a].nh,e=void 0,e='<div class="jg-image" style="left:'+b[a].l+'px">',e+=' <a href="'+g.href+'" ',e=!0==c.lightbox?e+('rel="'+g.rel+'"'):e+'target="_blank"',e+='title="'+g.title+'">',e+='  <img alt="'+g.alt+'" src="'+g.src+b[a].suffix+c.extension+'"',e+='style="width: '+b[a].nw+"px; height: "+d+'px;">',c.captions&&(e+='  <div style="bottom:'+(d-h)+'px;" class="jg-image-label">'+g.alt+"</div>"),e+=" </a></div>",
j+=e;return'<div class="jg-row" style="height: '+h+"px; margin-bottom:"+c.margins+'px;">'+j+"</div>"}function n(b,f,d,c,a){var c=[],g,h,i=0,e=b(f).width();for(g=h=0;h<d.length;h++)i+d[h].width+a.margins<=e?(i+=d[h].width+a.margins,c[g]=Array(5),c[g].indx=h,g++):(g=Math.ceil((e-i+1)/c.length),b(f).append(m(c,d,g,a)),c=[],c[0]=Array(5),c[0].indx=h,g=1,i=d[h].width+a.margins);g=a.justifyLastRow?Math.ceil((e-i+1)/c.length):0;b(f).append(m(c,d,g,a));if(a.lightbox)try{b(f).find(".jg-image a").colorbox({maxWidth:"80%",
maxHeight:"80%",opacity:0.8,transition:"elastic",current:""})}catch(l){b(f).html('<div style="font-size: 12px; border: 1px solid red; background-color: #faa; margin: 10px 0px 10px 0px; padding: 5px 0px 5px 5px;">No Colorbox founded!</div>')}a.captions&&(b(f).find(".jg-image").mouseenter(function(a){b(a.currentTarget).find(".jg-image-label").stop();b(a.currentTarget).find(".jg-image-label").fadeTo(500,0.7)}),b(f).find(".jg-image").mouseleave(function(a){b(a.currentTarget).find(".jg-image-label").stop();
b(a.currentTarget).find(".jg-image-label").fadeTo(500,0)}));b(f).find(".jg-image img").one("load",function(){b(this).fadeTo(500,1)}).each(function(){this.complete&&b(this).load()});var k=setInterval(function(){if(e!=b(f).width()){b(f).find(".jg-row").remove();clearInterval(k);n(b,f,d,e,a)}},a.refreshTime)}var i=d.extend({sizeSuffixes:{lt100:"_t",lt240:"_m",lt320:"_n",lt500:"",lt640:"_z",lt1024:"_b"},usedSuffix:"lt240",justifyLastRow:!0,rowHeight:120,fixedHeight:!1,lightbox:!1,captions:!0,margins:1,
extension:".jpg",refreshTime:500},l);return this.each(function(b,f){d(f).addClass("justifiedGallery");var j=0,c=Array(d(f).find("img").length);__justifiedGallery_galleryID++;0!=c.length&&(d(f).append('<div class="jg-loading"><div class="jg-loading-img"></div></div>'),d(f).find("a").each(function(a,b){var h=d(b).find("img");c[a]=Array(5);c[a].src=d(h).attr("src");c[a].alt=d(h).attr("alt");c[a].href=d(b).attr("href");c[a].title=d(b).attr("title");c[a].rel="lightbox[gallery-"+__justifiedGallery_galleryID+
"]";d(b).remove();d("<img/>").attr("src",c[a].src).load(function(){c[a].width=c[a].height!=i.rowHeight?Math.ceil(this.width/(this.height/i.rowHeight)):this.width;c[a].height=i.rowHeight;c[a].src=c[a].src.slice(0,c[a].src.length-(i.sizeSuffixes[i.usedSuffix]+i.extension).length);j++;j==c.length&&d(f).find(".jg-loading").fadeOut(500,function(){d(this).remove();n(d,f,c,0,i)})})}))})}})(jQuery);
