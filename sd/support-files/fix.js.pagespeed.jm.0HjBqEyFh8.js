var FIX=FIX||{};FIX.addEventListener=function(el,type,callback){if(typeof el.addEventListener==='function'){el.addEventListener(type,callback,false);}else if(typeof el.attachEvent==='object'&&el.attachEvent!==null){el.attachEvent('on'+type,callback);}};FIX.removeEventListener=function(el,type,callback){if(typeof el.removeEventListener==='function'){el.removeEventListener(type,callback,false);}else if(typeof el.detachEvent==='object'&&el.detachEvent!==null){el.detachEvent('on'+type,callback);}};FIX.pageWrapperHeight=0;FIX.designMode=FIX.designMode||"";FIX.passwordProtection="none";FIX.headerHeight=0;FIX.isFixedHeader=false;FIX.getBoxPropertyValue=function(el,property){var camelProperties={'padding-top':'paddingTop','padding-right':'paddingRight','padding-bottom':'paddingBottom','padding-left':'paddingLeft','border-top-width':'borderTopWidth','border-right-width':'borderRightWidth','border-bottom-width':'borderBottomWidth','border-left-width':'borderLeftWidth','margin-top':'marginTop','margin-right':'marginRight','margin-bottom':'marginBottom','margin-left':'marginLeft','width':'width'};if(!camelProperties[property]){throw new Error('FIX unknown property "'+property+'".');}var styleValue='';if(typeof window.getComputedStyle==='function'){styleValue=parseInt(window.getComputedStyle(el,null).getPropertyValue(property),10);}else if(typeof el.currentStyle==='object'&&el.currentStyle!==null){styleValue=parseInt(el.currentStyle[camelProperties[property]],10);}if(isNaN(styleValue)){styleValue=0;}return styleValue;};FIX.findLiner=function(parentId){var parent=document.getElementById(parentId);if(!parent){return;}var el=parent.firstChild;while(el){if(/(^|\s)Liner(\s|$)/.test(el.className)){return el;}el=el.nextSibling;}};FIX.isImageBlockImage=function(img){var el=img;while(el){if(/(^|\s)ImageBlock(\s|$)/.test(el.className)){return true;}else if(/(^|\s)Liner(\s|$)/.test(el.className)){return false;}el=el.parentNode;}return false;};FIX.computeHeightForLiner=function(el,height){var verticalPadding=FIX.getBoxPropertyValue(el,'padding-top')+FIX.getBoxPropertyValue(el,'padding-bottom');var verticalBorder=FIX.getBoxPropertyValue(el,'border-top-width')+FIX.getBoxPropertyValue(el,'border-bottom-width');var topMargin=FIX.getBoxPropertyValue(el,'margin-top');return height-verticalPadding-verticalBorder-topMargin;};FIX.computeAvailableWidth=function(el){var horizontalPadding=FIX.getBoxPropertyValue(el,'padding-left')+FIX.getBoxPropertyValue(el,'padding-right');return el.clientWidth-horizontalPadding;};FIX.computeTotalWidth=function(el,availableWidth){var horizontalPadding=FIX.getBoxPropertyValue(el,'padding-left')+FIX.getBoxPropertyValue(el,'padding-right');var horizontalBorder=FIX.getBoxPropertyValue(el,'border-left-width')+FIX.getBoxPropertyValue(el,'border-right-width');var horizontalMargin=FIX.getBoxPropertyValue(el,'margin-left')+FIX.getBoxPropertyValue(el,'margin-right');if(horizontalMargin===(availableWidth-el.width-horizontalBorder)){horizontalMargin=0;}return el.width+horizontalPadding+horizontalMargin+horizontalBorder;};FIX.fixLiners=function(){var pageWrapper=document.getElementById('PageWrapper');var ids=['ContentColumn','NavColumn','ExtraColumn'];var highestLinerHeight=0;var liners=[];var id;var liner;var i,ilen;var linerNewHeight;for(i=0,ilen=ids.length;i<ilen;i++){id=ids[i];liner=FIX.findLiner(id);if(liner){var linerTopMargin=FIX.getBoxPropertyValue(liner,'margin-top');var linerHeight=liner.offsetHeight+linerTopMargin;liners.push(liner);if(linerHeight>highestLinerHeight){highestLinerHeight=linerHeight;}}}for(i=0,ilen=liners.length;i<ilen;i++){liner=liners[i];if(liner){linerNewHeight=FIX.computeHeightForLiner(liner,highestLinerHeight);if(linerNewHeight>0){linerNewHeight=linerNewHeight+'px';if(typeof document.body.style.maxHeight==="undefined"){liner.style.height=linerNewHeight;}else{liner.style.minHeight=linerNewHeight;}}}}FIX.pageWrapperHeight=pageWrapper.offsetHeight;};FIX.imageResizer=function(image){var imgTotalWidth;image.style.display="";var container=image.parentNode;while(container.tagName!=='DIV'){container=container.parentNode;if(container.tagName==='BODY'){break;}}var maxWidth=FIX.computeAvailableWidth(container);imgTotalWidth=FIX.computeTotalWidth(image,maxWidth);if(imgTotalWidth>maxWidth){image.width=(image.width-(imgTotalWidth-maxWidth));image.style.height="auto";if(FIX.designMode==="legacy"){if(typeof MOBILE==='undefined'||MOBILE.viewMode!=='mobile'){FIX.fixLiners();}}}};FIX.fixImgs=function(){var ids;var id;var liners=[];var liner;var i,ilen;var images;var image;var originalAttributeWidth;if(FIX.passwordProtection==="on"){ids=['NavColumn','ExtraColumn','Header','Footer'];}else if(FIX.passwordProtection==="off"){ids=['ContentColumn'];var styleContent='#ContentColumn .ImageBlock img { display: none; }';var head=document.getElementsByTagName("head")[0];var style=document.createElement("style");style.setAttribute('type','text/css');style.setAttribute('id','hideImgs');if(style.styleSheet){style.styleSheet.cssText=styleContent;}else{style.appendChild(document.createTextNode(styleContent));}head.appendChild(style);}else{ids=['ContentColumn','NavColumn','ExtraColumn','Header','Footer'];}var hideImgsStyle=document.getElementById("hideImgs");for(i=0,ilen=ids.length;i<ilen;i++){id=ids[i];liner=FIX.findLiner(id);if(liner){liners.push({element:liner,images:liner.getElementsByTagName("img")});}}if(hideImgsStyle){hideImgsStyle.parentNode.removeChild(hideImgsStyle);}for(i=0,ilen=liners.length;i<ilen;i++){images=liners[i].images;for(var j=0,jlen=images.length;j<jlen;j++){image=images[j];if(FIX.isImageBlockImage(image)){image.style.display="none";}}}for(i=0,ilen=liners.length;i<ilen;i++){images=liners[i].images;for(j=0,jlen=images.length;j<jlen;j++){image=images[j];if(FIX.isImageBlockImage(image)){image.style.display="block";image.style.maxWidth="none";originalAttributeWidth=image.getAttribute("width");if(originalAttributeWidth){image.setAttribute("data-width",parseInt(originalAttributeWidth,10));}(function(img,width){if(img.complete){FIX.imageResizer(img);}else{image.style.display="none";img.onload=function(){FIX.imageResizer(img);}}FIX.addEventListener(window,'load',function(){FIX.imageResizer(img);});if(FIX.passwordProtection==="off"){FIX.imageResizer(img);}}(image));}}}};FIX.scrollIntoViewHash=function(){var el=document.getElementById(window.location.hash.replace("#",""));if(el){var y=el.offsetTop;while(el=el.offsetParent){y+=el.offsetTop;}setTimeout(function(){window.scrollTo(0,y-FIX.headerHeight);},500);}};FIX.scrollIntoViewHashLinks=function(){var links=document.getElementsByTagName("a");function scrollWithOffset(event,el,href){var url=window.location.href;var baseAhref=href.substr(0,href.indexOf("#"));var baseUrl=url.substr(0,url.indexOf("#"))||url;if(baseAhref!==baseUrl){return true;}var y=el.offsetTop;while(el=el.offsetParent){y+=el.offsetTop;}window.scrollTo(0,y-FIX.headerHeight);if(event.preventDefault){event.preventDefault();}else{event.returnValue=false;}return false;}for(var i=0,ilen=links.length;i<ilen;i++){var ahref=links[i].href;if(ahref.indexOf("#")>0){var anchorId=ahref.substr(ahref.indexOf("#")+1,ahref.length);var el=document.getElementById(anchorId);if(el){(function(alink,element){FIX.addEventListener(alink,'click',function(event){scrollWithOffset(event,element,alink.href);},false);}(links[i],el))}}}};FIX.modernize=function(){var body=document.querySelector('body');var head=document.querySelector('body');var style=document.createElement('style');style.setAttribute('type','text/css');style.innerHTML='.ImageBlock img { box-sizing: border-box; }';head.appendChild(style);FIX.fixImgs=function(){};};FIX.doEndOfHead=function(){document.write('<style id="hideImgs" type="text/css">#PageWrapper .ImageBlock img { display: none; }</style>');};FIX.doEndOfBody=function(){var pageWrapper=document.getElementById('PageWrapper');if(!pageWrapper){return;}var startLoop=function(){var counter=0;var max=120;var delay=500;var loop=function(){counter++;if(counter>max){return;}pageWrapper=document.getElementById('PageWrapper');if(pageWrapper.offsetHeight!==FIX.pageWrapperHeight){FIX.fixLiners();}setTimeout(function(){loop();},delay);};loop();};FIX.fixImgs();FIX.fixEzine2LabelWidth();FIX.responsiveVideo();window.addEventListener("resize",FIX.fixEzine2LabelWidth,true);if((typeof MOBILE==='undefined'||MOBILE.viewMode!=='mobile')&&FIX.isFixedHeader){FIX.headerHeight=document.getElementById("Header").offsetHeight;FIX.scrollIntoViewHashLinks();}if(window.location.hash){FIX.addEventListener(window,'load',FIX.scrollIntoViewHash);}if(FIX.designMode==="legacy"){if(typeof MOBILE==='undefined'||MOBILE.viewMode!=='mobile'){FIX.fixLiners();if(document.readyState==="complete"){startLoop();}else{FIX.addEventListener(window,'load',startLoop);}}}FIX.horizontalNavbar();};FIX.track=function(anchorEl){if(/sbi[^.]+.?\.sitesell\.com/.test(window.location.href)){return true;}else{var anchorElHref=/href="(.*?)"/g.exec(anchorEl.outerHTML)[1];var path=anchorElHref.split("/").slice(3).join("/");var matches=anchorElHref.match(/^https?\:\/\/([^\/]+)/);var thisDomain=window.location.hostname.replace(/^www\./,"");if(matches&&(thisDomain!==matches[1].substr(-thisDomain.length))&&(!/google/.test(matches[1]))&&(!/\.mp4|\.avi|\.css|\.doc|\.docx|\.dot|\.dotx|\.exe|\.flv|\.gif|\.jpeg|\.jpg|\.js|\.mov|\.mp3|\.mp4|\.mpeg|\.mpg|\.png|\.potx|\.pps|\.ppsx|\.ppt|\.pptx|\.qt|\.ra|\.ram|\.rm|\.swf|\.tex|\.txt|\.wav|\.wma|\.wmv|\.xls|\.xlsx|\.xlt|\.xltx|\.xml|\.zip/.test(path))){var url='/cgi-bin/counter.pl?url='+encodeURIComponent(anchorElHref)+'&referrer='+encodeURIComponent(window.location);if(anchorEl.target.toLowerCase()==='_blank'){window.open(url);}else{window.location.href=url;}return false;}else{return true;}}};var getMsg=(function(){var original=getMsg;return function(form){var result=original(form);if(document.getElementById('ProtectedContent').style.display==='block'){FIX.passwordProtection="off";FIX.doEndOfBody();}return result;};}());if('ab'.substr(-1)!='b'){String.prototype.substr=function(substr){return function(start,length){if(start<0)start=this.length+start;return substr.call(this,start,length);}}(String.prototype.substr);}FIX.getByClassName=function(cn){var arr=[];var els=document.getElementsByTagName("*");var exp=new RegExp("^(.* )?"+cn+"( .*)?$","g");for(var i=0;i<els.length;i++){if(exp.test(els[i].className)){arr.push(els[i]);}}return arr;};FIX.horizontalNavBarWide=function(){if(document.all&&!document.querySelector){var wideHorizontalNavs=FIX.getByClassName("HorizontalNavBarWide");for(var i=0,ilen=wideHorizontalNavs.length;i<ilen;i++){wideHorizontalNavs[i].className=wideHorizontalNavs[i].className.replace("HorizontalNavBarWide","HorizontalNavBarCenter");}}};FIX.horizontalNavDropDownOn={};FIX.horizontalNavDropDownOff={};FIX.horizontalNavDropDownForceOn={};FIX.horizontalNavbar=function(){var horizontalNavs=FIX.getByClassName("HorizontalNavBar");var horizontalNavEntered=[];var delay=350;var mobile=/iPhone|iPod|iPad|BlackBerry|PlayBook|Touch|Android|Silk/.test(navigator.userAgent);var ie6=(typeof document.body.style.maxHeight==='undefined');function showSubmenu(li){li.className+=" hover";}function hideSubmenu(li){li.className=li.className.replace(/(^|\s+)hover/,'');}function hideTheSameLevelSubmenus(nav,level){var exp=new RegExp("li"+level);var lis=nav.getElementsByTagName("li");for(var i=0,ilen=lis.length;i<ilen;i++){var liClassName=lis[i].className;if(liClassName.match(/hover/)&&liClassName.match(exp)){hideSubmenu(lis[i]);}}}if(mobile){function hideSubmenuMobile(){var hovers=document.querySelectorAll(".HorizontalNavBar .hover");for(var i=0,ilen=hovers.length;i<ilen;i++){hovers[i].className=hovers[i].className.replace(/(^|\s+)hover/,'');}}function revertPointers(){var pointers=document.querySelectorAll(".navheader b");for(var i=0,ilen=pointers.length;i<ilen;i++){}}var pageWrapper=document.getElementById("PageWrapper");FIX.addEventListener(pageWrapper,'click',function(){hideSubmenuMobile();revertPointers();});}for(var i=0,ilen=horizontalNavs.length;i<ilen;i++){horizontalNavs[i].className=horizontalNavs[i].className.replace("HorizontalNavBarCSS","");if(mobile){(function(nav){nav.addEventListener("touchend",function(e){e.stopPropagation();},false);}(horizontalNavs[i]));}horizontalNavEntered.push(false);var horizontalNavDelayOn;var horizontalNavDelayOff;(function(nav,i){var timer=null;horizontalNavDelayOn=function(){clearTimeout(timer);timer=setTimeout(function(){horizontalNavEntered[i]=true;},delay);};horizontalNavDelayOff=function(){clearTimeout(timer);timer=setTimeout(function(){horizontalNavEntered[i]=false;},delay);};FIX.addEventListener(nav,'mouseover',horizontalNavDelayOn);FIX.addEventListener(nav,'mouseout',horizontalNavDelayOff);}(horizontalNavs[i],i));var lis=horizontalNavs[i].getElementsByTagName("li");for(var j=0,jlen=lis.length;j<jlen;j++){if(mobile){(function(li,i,j){FIX.addEventListener(li,'click',function(e){e.stopPropagation();if(!/hover/.test(li.className)){var navigationLevel=li.className.match(/li[0-9]/).input[2];hideTheSameLevelSubmenus(horizontalNavs[i],navigationLevel);showSubmenu(li);}else{hideSubmenu(li);}});}(lis[j],i,j));}else{(function(li,i,j){var timer=null;var localDelay=delay;FIX.horizontalNavDropDownOn[j]=function(){clearTimeout(timer);if(!li.className.match(/hover/)){if(li.className.match(/submenu/)){var navigationLevel=li.className.match(/li[0-9]/).input[2];hideTheSameLevelSubmenus(horizontalNavs[i],navigationLevel);}if(horizontalNavEntered[i]){localDelay=0;}else{localDelay=delay;}timer=setTimeout(function(){showSubmenu(li);},localDelay);}};FIX.horizontalNavDropDownOff[j]=function(){clearTimeout(timer);if(li.className.match(/hover/)){timer=setTimeout(function(){hideSubmenu(li);},delay);}};FIX.horizontalNavDropDownForceOn[j]=function(){if(!li.className.match(/hover/)){clearTimeout(timer);showSubmenu(li);}};FIX.addEventListener(li,'mouseover',FIX.horizontalNavDropDownOn[j]);FIX.addEventListener(li,'mouseout',FIX.horizontalNavDropDownOff[j]);FIX.addEventListener(li,'click',FIX.horizontalNavDropDownForceOn[j]);}(lis[j],i,j));}}if(ie6){var spans=horizontalNavs[i].getElementsByTagName("span");for(var k=0,klen=spans.length;k<klen;k++){(function(span){FIX.addEventListener(span,'mouseover',function(){span.className+=" hover";});FIX.addEventListener(span,'mouseout',function(){span.className=span.className.replace(/(^|\s+)hover/,'');});}(spans[k]));}}var navheaders=horizontalNavs[i].getElementsByTagName("span");for(var l=0,llen=navheaders.length;l<llen;l++){navheaders[l].innerHTML='<ins></ins>'+navheaders[l].innerHTML;}}FIX.horizontalNavBarWide();};FIX.horizontalNavbarOff=function(){var horizontalNavs=FIX.getByClassName("HorizontalNavBar");var mobile=/iPhone|iPod|iPad|BlackBerry|PlayBook|Touch|Android|Silk/.test(navigator.userAgent);for(var i=0,ilen=horizontalNavs.length;i<ilen;i++){var lis=horizontalNavs[i].getElementsByTagName("li");for(var j=0,jlen=lis.length;j<jlen;j++){if(!mobile){(function(li,i,j){FIX.removeEventListener(li,'mouseover',FIX.horizontalNavDropDownOn[j]);FIX.removeEventListener(li,'mouseout',FIX.horizontalNavDropDownOff[j]);FIX.removeEventListener(li,'click',FIX.horizontalNavDropDownForceOn[j]);}(lis[j],i,j));}}}};FIX.fixEzine2LabelWidth=function(){var ezines2=document.querySelectorAll('.EzineHorizontal'),ezine2,i,ilen,labels,label,offsetTop=[],j,jlen,width,maxWidth;if(!ezines2){return;}for(i=0,ilen=ezines2.length;i<ilen;i+=1){ezine2=ezines2[i];labels=ezine2.querySelectorAll('label');if(labels){jlen=labels.length;maxWidth=0;for(j=0;j<jlen;j+=1){label=labels[j];offsetTop[j]=label.offsetTop;label.style.width='auto';width=FIX.getBoxPropertyValue(label,'width');maxWidth=(width>maxWidth)?width:maxWidth;}if(offsetTop[0]!==offsetTop[offsetTop.length-1]){for(j=0;j<jlen;j+=1){label=labels[j];label.style.width=maxWidth+1+"px";}}}}};FIX.responsiveVideo=function(){var iframes,iframe,i,ilen,wrapper,parent,sibling;iframes=document.querySelectorAll('iframe');for(i=0,ilen=iframes.length;i<ilen;i+=1){iframe=iframes[i];if(/youtube\.com/.test(iframe.src)){wrapper=document.createElement('div');wrapper.className='video-container';sibling=iframe.nextSibling;parent=iframe.parentNode;wrapper.appendChild(iframe);parent.insertBefore(wrapper,sibling);}}};