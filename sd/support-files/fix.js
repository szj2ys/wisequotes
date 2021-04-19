var FIX = FIX || {};

FIX.addEventListener = function(el, type, callback) {
    if (typeof el.addEventListener === 'function') {
        el.addEventListener(type, callback, false);
    }
    else if (typeof el.attachEvent === 'object' && el.attachEvent !== null) {
        el.attachEvent('on'+type, callback);
    }
};


FIX.removeEventListener = function(el, type, callback) {
    if (typeof el.removeEventListener === 'function') {
        el.removeEventListener(type, callback, false);
    }
    else if (typeof el.detachEvent === 'object' && el.detachEvent !== null) {
        el.detachEvent('on' + type, callback);
    }
};

FIX.pageWrapperHeight = 0;
FIX.designMode = FIX.designMode || "";
FIX.passwordProtection = "none";
FIX.headerHeight = 0;
FIX.isFixedHeader = false;

// gets a number value for a given property describing box model dimensions
FIX.getBoxPropertyValue = function(el, property) {
    var camelProperties = {
        'padding-top' : 'paddingTop',
        'padding-right' : 'paddingRight',
        'padding-bottom' : 'paddingBottom',
        'padding-left' : 'paddingLeft',
        'border-top-width' : 'borderTopWidth',
        'border-right-width' : 'borderRightWidth',
        'border-bottom-width' : 'borderBottomWidth',
        'border-left-width' : 'borderLeftWidth',
        'margin-top' : 'marginTop',
        'margin-right' : 'marginRight',
        'margin-bottom' : 'marginBottom',
        'margin-left' : 'marginLeft',
        'width' : 'width'
    };
    if (!camelProperties[property]) {
        throw new Error('FIX unknown property "'+property+'".');
    }

    var styleValue = '';

    if (typeof window.getComputedStyle === 'function') {
        styleValue = parseInt(window.getComputedStyle(el, null).getPropertyValue(property), 10);
    }
    else if (typeof el.currentStyle === 'object' && el.currentStyle !== null) {
        styleValue = parseInt(el.currentStyle[camelProperties[property]], 10);
    }

    // margins and borders should be numbers,
    // however on IEs and Opera values as 'auto' or 'none' can't be converted to Number
    if (isNaN(styleValue)) {
        styleValue = 0;
    }

    return styleValue;
};

// finds .Liner (section's inner wrapper) for a given section ID
FIX.findLiner = function(parentId) {
    var parent = document.getElementById(parentId);
    if (!parent) {
        return;
    }
    var el = parent.firstChild;
    while (el) {
        if (/(^|\s)Liner(\s|$)/.test(el.className)) {
            return el;
        }
        el = el.nextSibling;
    }
};

// checks if an image is an ImageBlock's one
FIX.isImageBlockImage = function(img) {
    var el = img;
    while (el) {
        if (/(^|\s)ImageBlock(\s|$)/.test(el.className)) {
            return true;
        }
        else if (/(^|\s)Liner(\s|$)/.test(el.className)) {
            return false; // no need to continue looking
        }
        el = el.parentNode;
    }
    return false;
};

FIX.computeHeightForLiner = function(el, height) {
    var verticalPadding = FIX.getBoxPropertyValue(el, 'padding-top') +
                          FIX.getBoxPropertyValue(el, 'padding-bottom');
    var verticalBorder = FIX.getBoxPropertyValue(el, 'border-top-width') +
                         FIX.getBoxPropertyValue(el, 'border-bottom-width');
    var topMargin = FIX.getBoxPropertyValue(el, 'margin-top');

    return height - verticalPadding - verticalBorder - topMargin;
};

FIX.computeAvailableWidth = function(el) {
    var horizontalPadding = FIX.getBoxPropertyValue(el, 'padding-left') +
                            FIX.getBoxPropertyValue(el, 'padding-right');

    return el.clientWidth - horizontalPadding;
};

// gets total width (= amount of space reserved by an element) of an element
FIX.computeTotalWidth = function(el, availableWidth) {
    var horizontalPadding = FIX.getBoxPropertyValue(el, 'padding-left') +
                            FIX.getBoxPropertyValue(el, 'padding-right');
    var horizontalBorder = FIX.getBoxPropertyValue(el, 'border-left-width') +
                           FIX.getBoxPropertyValue(el, 'border-right-width');
    var horizontalMargin = FIX.getBoxPropertyValue(el, 'margin-left') +
                           FIX.getBoxPropertyValue(el, 'margin-right');

    // fix for an issue that might be caused by user's custom CSS overriding SS default CSS code for images
    // for div-based layouts negative right margins appears on: Safari lte 4 (for block images)
    // and IE 9, Chrome ~20 (for block images with margin: auto)
    // the negative margin equals the width of that part of an image that would stick out
    // if no image resizing was performed
    if (horizontalMargin === (availableWidth - el.width - horizontalBorder)) {
        horizontalMargin = 0;
    }

    return el.width + horizontalPadding + horizontalMargin + horizontalBorder;
};

// sets min-height (height for IE6) for columns' liners to make all columns equally long
FIX.fixLiners = function() {
    var pageWrapper = document.getElementById('PageWrapper');
    var ids = ['ContentColumn', 'NavColumn', 'ExtraColumn'];
    var highestLinerHeight = 0;
    var liners = [];
    var id;
    var liner;
    var i, ilen;
    var linerNewHeight;

    // find the longest liner
    for (i=0, ilen=ids.length; i<ilen; i++) {
        id = ids[i];
        liner = FIX.findLiner(id);
        if (liner) {
            var linerTopMargin = FIX.getBoxPropertyValue(liner, 'margin-top');
            var linerHeight = liner.offsetHeight + linerTopMargin;
            liners.push(liner);
            if (linerHeight > highestLinerHeight) {
                highestLinerHeight = linerHeight;
            }
        }
    }

    // make all liners equally long
    for (i=0, ilen=liners.length; i<ilen; i++) {
        liner = liners[i];
        if (liner) {
            linerNewHeight = FIX.computeHeightForLiner(liner, highestLinerHeight);
            if (linerNewHeight > 0) {
                linerNewHeight = linerNewHeight + 'px';
                // check if the browser understands min-height
                // by checking maxHeight property for body
                // as checking minHeight will not detect not understanding max/min height by IE6
                if (typeof document.body.style.maxHeight === "undefined") {
                    // IE 6
                    liner.style.height = linerNewHeight;
                }
                else {
                    liner.style.minHeight = linerNewHeight;
                }
            }
        }
    }

    // set pageWrapper height to check later if it has changed (i.e. because of 3rd party scripts)
    FIX.pageWrapperHeight = pageWrapper.offsetHeight;
};

// resize image if it's too large
FIX.imageResizer = function(image) {
    var imgTotalWidth;
    // remove inline style that hid the image
    image.style.display = "";
    // get the available width of the image's direct container
    var container = image.parentNode;
    while (container.tagName !== 'DIV') {
        container = container.parentNode;
        if (container.tagName === 'BODY') {
            break;
        }
    }

    var maxWidth = FIX.computeAvailableWidth(container);

    imgTotalWidth = FIX.computeTotalWidth(image, maxWidth);

    if (imgTotalWidth > maxWidth) {
        // set new width
        image.width = (image.width - (imgTotalWidth - maxWidth));
        // override image height to avoid changing image's aspect ratio
        image.style.height = "auto";
        // fix liners height in legacy templates
        if (FIX.designMode === "legacy") {
            if (typeof MOBILE === 'undefined' || MOBILE.viewMode !== 'mobile') {
                FIX.fixLiners();
            }
        }
    }
};

// resize too wide ImageBlock images to match the available space (liners or columns block's columns)
FIX.fixImgs = function() {
    var ids;
    var id;
    var liners = [];
    var liner;
    var i, ilen;
    var images;
    var image;
    var originalAttributeWidth;

    // password protected content is on this page, yet no correct password has been submitted
    if (FIX.passwordProtection === "on") {
        ids = ['NavColumn', 'ExtraColumn', 'Header', 'Footer'];
    // correct password has been submitted
    } else if (FIX.passwordProtection === "off") {
        ids = ['ContentColumn'];
        // hide images only in ContentColumn
        var styleContent = '#ContentColumn .ImageBlock img { display: none; }';
        var head = document.getElementsByTagName("head")[0];
        var style = document.createElement("style");
        style.setAttribute('type', 'text/css');
        style.setAttribute('id', 'hideImgs');
        if (style.styleSheet) {
            // IE
            style.styleSheet.cssText = styleContent;
        }
        else {
            // browsers
            style.appendChild(document.createTextNode(styleContent));
        }
        head.appendChild(style);
    } else {
        // there's no password protected content on this page
        ids = ['ContentColumn', 'NavColumn', 'ExtraColumn', 'Header', 'Footer'];
    }

    var hideImgsStyle = document.getElementById("hideImgs");

    // read liners' available widths and store images for further operations
    // at this point all ImageBlock images are hidden
    for (i=0, ilen=ids.length; i<ilen; i++) {
        id = ids[i];
        liner = FIX.findLiner(id);
        if (liner) {
            liners.push({
                element : liner,
                images : liner.getElementsByTagName("img")
            });
        }
    }

    // remove head style that was needed to hide ImageBlock images
    if (hideImgsStyle) {
        hideImgsStyle.parentNode.removeChild(hideImgsStyle);
    }

    // set display="none" to all ImageBlock images
    for (i=0, ilen=liners.length; i<ilen; i++) {
        images = liners[i].images;
        for (var j=0, jlen=images.length; j<jlen; j++) {
            image = images[j];
            if (FIX.isImageBlockImage(image)) { // hide only ImageBlock images
                image.style.display = "none";
            }
        }
    }

    // fix images' widths
    for (i=0, ilen=liners.length; i<ilen; i++) {
        images = liners[i].images;
        for ( j=0, jlen=images.length; j<jlen; j++) {
            image = images[j];
            if (FIX.isImageBlockImage(image)) { // deal only with ImageBlock images
                // set display to block for IE to get real width of an image when image complete is true
                image.style.display = "block";
                // ImageBlock images don't need to use non-JS max-width anymore
                image.style.maxWidth = "none";

                // store original attribute width for MOBILE.fixImageProportions and responsive designs
                originalAttributeWidth = image.getAttribute("width");
                if (originalAttributeWidth) {
                    image.setAttribute("data-width", parseInt(originalAttributeWidth, 10));
                }

                // resize image
                (function(img, width) {
                    if(img.complete) { // already loaded images
                        FIX.imageResizer(img);
                    } // non-cached images
                    else {
                        // hide image via inline style
                        image.style.display = "none";
                        // resize images on load
                        img.onload = function() {
                            FIX.imageResizer(img);
                        }
                    }
                    // just in case (IE) lets run the resizer also on page load
                    FIX.addEventListener(window, 'load', function(){
                        FIX.imageResizer(img);
                    });
                    // and exclusively for IE10 in case of protected content after providing the right password
                    if (FIX.passwordProtection === "off") {
                        FIX.imageResizer(img);
                    }
                }(image));
            }
        }
    }
};

FIX.scrollIntoViewHash = function() {
    var el = document.getElementById(window.location.hash.replace("#", ""));
    if (el) {
        var y = el.offsetTop;
        while (el = el.offsetParent) {
            y += el.offsetTop;
        }
        setTimeout(function() {
            window.scrollTo(0, y - FIX.headerHeight);
        }, 500);
    }
};

FIX.scrollIntoViewHashLinks = function () {
    var links = document.getElementsByTagName("a");

    function scrollWithOffset(event, el, href) {
        var url = window.location.href;
        var baseAhref = href.substr(0, href.indexOf("#"));
        var baseUrl = url.substr(0, url.indexOf("#")) || url;
        if (baseAhref !== baseUrl) {
            // return if not the same page anchor link
            return true;
        }

        var y = el.offsetTop;
        while (el = el.offsetParent) {
            y += el.offsetTop;
        }

        window.scrollTo(0, y - FIX.headerHeight);

        if (event.preventDefault) {
            event.preventDefault();
        } else {
            event.returnValue = false; // IE8
        }
        return false;
    }

    for (var i = 0, ilen = links.length; i < ilen; i++) {
        var ahref = links[i].href;

        if (ahref.indexOf("#") > 0) {
            var anchorId = ahref.substr(ahref.indexOf("#") + 1, ahref.length);
            var el = document.getElementById(anchorId);
            if (el) {
                (function (alink, element) {
                    FIX.addEventListener(alink, 'click', function (event) {
                        scrollWithOffset(event, element, alink.href);
                    }, false);
                }(links[i], el))
            }
        }
    }
};

FIX.modernize = function() {
    var body = document.querySelector('body');
    var head = document.querySelector('body');
    var style = document.createElement('style');
    style.setAttribute('type', 'text/css');
    style.innerHTML = '.ImageBlock img { box-sizing: border-box; }';
    head.appendChild(style);

    FIX.fixImgs = function() {};
};

FIX.doEndOfHead = function() {
    // use ID so we can remove this element later
    // hide only ImageBlock images - this is needed later for available space computations
    document.write('<style id="hideImgs" type="text/css">#PageWrapper .ImageBlock img { display: none; }</style>');
};

FIX.doEndOfBody = function() {
    var pageWrapper = document.getElementById('PageWrapper');
    if (!pageWrapper) {
        return; // quit silently when page is not a standard SS template (just in case)
    }

    var startLoop = function() {
        var counter = 0;
        var max = 120;
        var delay = 500;
        var loop = function() {
            counter++;
            if (counter > max) {
                return;
            }
            pageWrapper = document.getElementById('PageWrapper');
            // check if pageWrapper height has changed
            if (pageWrapper.offsetHeight !== FIX.pageWrapperHeight) {
                FIX.fixLiners();
            }
            setTimeout(function() {
                loop();
            }, delay);
        };
        loop();
    };

    FIX.fixImgs();
    FIX.fixEzine2LabelWidth();
    FIX.responsiveVideo();

    window.addEventListener("resize", FIX.fixEzine2LabelWidth, true);

    if ((typeof MOBILE === 'undefined' || MOBILE.viewMode !== 'mobile') && FIX.isFixedHeader) {
        FIX.headerHeight = document.getElementById("Header").offsetHeight;
        FIX.scrollIntoViewHashLinks();
    }

    if (window.location.hash) {
        FIX.addEventListener(window, 'load', FIX.scrollIntoViewHash);
    }

    // fix liners height only for legacy templates
    if (FIX.designMode === "legacy") {
        // fix liners height right away
        if (typeof MOBILE === 'undefined' || MOBILE.viewMode !== 'mobile') {
            FIX.fixLiners();
            // do fixLiners once again when all images are loaded as this may affect columns' height
            // and also run it a few more times in a loop (against 3rd party scripts that may extend a page)
            if (document.readyState === "complete") {
                // if the page is already loaded (i.e. for protected content)
                startLoop();
            } else {
                FIX.addEventListener(window, 'load', startLoop);
            }
        }
    }

    FIX.horizontalNavbar();
};

FIX.track = function (anchorEl) {
    if (/sbi[^.]+.?\.sitesell\.com/.test(window.location.href)) {
        return true; // we don't want to track links in preview
    }
    else {
        var anchorElHref = /href="(.*?)"/g.exec(anchorEl.outerHTML)[1];
        var path = anchorElHref.split("/").slice(3).join("/");
        var matches = anchorElHref.match(/^https?\:\/\/([^\/]+)/);
        var thisDomain = window.location.hostname.replace(/^www\./, "");
        if (matches &&
            (thisDomain !== matches[1].substr(-thisDomain.length)) && // local link
            (!/google/.test(matches[1])) && // don't include TLD ".com" because don't want to track "google.ca" either
            (!/\.mp4|\.avi|\.css|\.doc|\.docx|\.dot|\.dotx|\.exe|\.flv|\.gif|\.jpeg|\.jpg|\.js|\.mov|\.mp3|\.mp4|\.mpeg|\.mpg|\.png|\.potx|\.pps|\.ppsx|\.ppt|\.pptx|\.qt|\.ra|\.ram|\.rm|\.swf|\.tex|\.txt|\.wav|\.wma|\.wmv|\.xls|\.xlsx|\.xlt|\.xltx|\.xml|\.zip/.test(path)) // media link
            ) {
            // The link is an external, non-media and non-google link. We want to track this click.
            var url = '/cgi-bin/counter.pl?url=' + encodeURIComponent(anchorElHref) + '&referrer=' + encodeURIComponent(window.location);
            if (anchorEl.target.toLowerCase() === '_blank') {
                window.open(url);
            }
            else {
                window.location.href = url;
            }
            return false;
        }
        else {
            return true;
        }
    }
};

// password protection
var getMsg = (function() {
    var original = getMsg;
    return function(form) {
        var result = original(form);
        if (document.getElementById('ProtectedContent').style.display === 'block') {
            FIX.passwordProtection = "off";
            FIX.doEndOfBody();
        }
        return result;
    };
}());

// IE fix for start index negative values in substr
if ('ab'.substr(-1) != 'b') {
    String.prototype.substr = function(substr) {
        return function(start, length) {
            // did we get a negative start, calculate how much it is from the beginning of the string
            if (start < 0) start = this.length + start;

            // call the original function
            return substr.call(this, start, length);
        }
    } (String.prototype.substr);
}

FIX.getByClassName = function(cn){
    var arr = [];
    var els = document.getElementsByTagName("*");
    var exp = new RegExp("^(.* )?"+cn+"( .*)?$", "g");
    for (var i = 0; i < els.length; i++ ){
        if (exp.test(els[i].className)){
            arr.push(els[i]);
        }
    }
    return arr;
};

FIX.horizontalNavBarWide = function() {
    if (document.all && !document.querySelector) {
        var wideHorizontalNavs = FIX.getByClassName("HorizontalNavBarWide");
        for(var i = 0, ilen = wideHorizontalNavs.length; i < ilen; i++) {
            wideHorizontalNavs[i].className = wideHorizontalNavs[i].className.replace("HorizontalNavBarWide", "HorizontalNavBarCenter");
        }
    }
};

FIX.horizontalNavDropDownOn = {};
FIX.horizontalNavDropDownOff = {};
FIX.horizontalNavDropDownForceOn = {};

FIX.horizontalNavbar = function() {
    var horizontalNavs = FIX.getByClassName("HorizontalNavBar");
    var horizontalNavEntered = [];
    var delay = 350;
    var mobile = /iPhone|iPod|iPad|BlackBerry|PlayBook|Touch|Android|Silk/.test(navigator.userAgent);
    var ie6 = (typeof document.body.style.maxHeight === 'undefined');

    function showSubmenu(li) {
        li.className += " hover";
    }

    function hideSubmenu(li) {
        li.className = li.className.replace(/(^|\s+)hover/, '');
    }

    function hideTheSameLevelSubmenus(nav, level) {
        var exp = new RegExp("li"+ level);
        var lis = nav.getElementsByTagName("li");
        for (var i = 0, ilen = lis.length; i < ilen; i++) {
            var liClassName = lis[i].className;
            if (liClassName.match(/hover/) && liClassName.match(exp)) {
                hideSubmenu(lis[i]);
            }
        }
    }

    // hide submenus on mobile (tap outside the navigation)
    if (mobile) {
        function hideSubmenuMobile() {
            var hovers = document.querySelectorAll(".HorizontalNavBar .hover");
            for(var i = 0, ilen = hovers.length; i < ilen; i++) {
                hovers[i].className = hovers[i].className.replace(/(^|\s+)hover/, '');
            }
        }
        function revertPointers() {
            var pointers = document.querySelectorAll(".navheader b");
            for(var i = 0, ilen = pointers.length; i < ilen; i++) {
            }
        }

        var pageWrapper = document.getElementById("PageWrapper");
        FIX.addEventListener(pageWrapper, 'click', function() {
            hideSubmenuMobile();
            revertPointers();
        });
    }

    for(var i = 0, ilen = horizontalNavs.length; i < ilen; i++) {
        // remove CSS support of drop down
        horizontalNavs[i].className = horizontalNavs[i].className.replace("HorizontalNavBarCSS", "");

        // stop propagating touchend outside navigation wrappers
        if (mobile) {
            (function(nav) {
                nav.addEventListener("touchend", function(e) {
                    e.stopPropagation();
                }, false);
            }(horizontalNavs[i]));
        }

        // a flag to control whether to use delay (navigation not entered yet) or show submenus instantly
        horizontalNavEntered.push(false);

        var horizontalNavDelayOn;
        var horizontalNavDelayOff;

        (function(nav, i) {
            var timer = null;
            horizontalNavDelayOn = function() {
                clearTimeout(timer);
                timer = setTimeout(function() {
                    horizontalNavEntered[i] = true;
                }, delay);
            };
            horizontalNavDelayOff = function() {
                clearTimeout(timer);
                timer = setTimeout(function() {
                    horizontalNavEntered[i] = false;
                }, delay);
            };

            FIX.addEventListener(nav, 'mouseover', horizontalNavDelayOn);
            FIX.addEventListener(nav, 'mouseout', horizontalNavDelayOff);

        }(horizontalNavs[i], i));

        // drop down support
        var lis = horizontalNavs[i].getElementsByTagName("li");
        for(var j = 0, jlen = lis.length; j < jlen; j++) {
            if (mobile) {
                (function(li, i, j) {
                    FIX.addEventListener(li, 'click', function(e) {
                        // prevent propagation
                        e.stopPropagation();
                        // toggle hover
                        if (!/hover/.test(li.className)) {
                            var navigationLevel = li.className.match(/li[0-9]/).input[2];
                            hideTheSameLevelSubmenus(horizontalNavs[i], navigationLevel);
                            showSubmenu(li);
                        } else {
                            hideSubmenu(li);
                        }
                    });
                }(lis[j], i, j));
            }
            else { // desktop
                (function(li, i, j) {
                    var timer = null;
                    var localDelay = delay;
                    FIX.horizontalNavDropDownOn[j] = function() {
                        clearTimeout(timer);
                        if (!li.className.match(/hover/)) {
                            if (li.className.match(/submenu/)) {
                                var navigationLevel = li.className.match(/li[0-9]/).input[2];
                                hideTheSameLevelSubmenus(horizontalNavs[i], navigationLevel);
                            }
                            if (horizontalNavEntered[i]) {
                                localDelay = 0;
                            } else {
                                localDelay = delay;
                            }
                            timer = setTimeout(function() {
                                showSubmenu(li);
                            }, localDelay);
                        }
                    };
                    FIX.horizontalNavDropDownOff[j] = function() {
                        clearTimeout(timer);
                        if (li.className.match(/hover/)) {
                            timer = setTimeout(function() {
                                hideSubmenu(li);
                            }, delay);
                        }
                    };
                    FIX.horizontalNavDropDownForceOn[j] = function() {
                        if (!li.className.match(/hover/)) {
                            clearTimeout(timer);
                            showSubmenu(li);
                        }
                    };
                    FIX.addEventListener(li, 'mouseover', FIX.horizontalNavDropDownOn[j]);
                    FIX.addEventListener(li, 'mouseout', FIX.horizontalNavDropDownOff[j]);
                    FIX.addEventListener(li, 'click', FIX.horizontalNavDropDownForceOn[j]);
                }(lis[j], i, j));
            }
        }

        // IE6 hover span
        if (ie6) {
            var spans = horizontalNavs[i].getElementsByTagName("span");
            for(var k = 0, klen = spans.length; k < klen; k++) {
                (function(span) {
                    FIX.addEventListener(span, 'mouseover', function() {
                        span.className += " hover";
                    });
                    FIX.addEventListener(span, 'mouseout', function() {
                        span.className = span.className.replace(/(^|\s+)hover/, '');
                    });
                }(spans[k]));
            }
        }

        // generate submenu pointers
        var navheaders = horizontalNavs[i].getElementsByTagName("span");
        for(var l = 0, llen = navheaders.length; l < llen; l++) {
            navheaders[l].innerHTML = '<ins></ins>' + navheaders[l].innerHTML;
        }
    }
    FIX.horizontalNavBarWide();
};

FIX.horizontalNavbarOff = function() {
    var horizontalNavs = FIX.getByClassName("HorizontalNavBar");
    var mobile = /iPhone|iPod|iPad|BlackBerry|PlayBook|Touch|Android|Silk/.test(navigator.userAgent);
    // drop down support
    for(var i = 0, ilen = horizontalNavs.length; i < ilen; i++) {
        var lis = horizontalNavs[i].getElementsByTagName("li");
        for (var j = 0, jlen = lis.length; j < jlen; j++) {
            if (!mobile) {
                (function (li, i, j) {
                    FIX.removeEventListener(li, 'mouseover', FIX.horizontalNavDropDownOn[j]);
                    FIX.removeEventListener(li, 'mouseout', FIX.horizontalNavDropDownOff[j]);
                    FIX.removeEventListener(li, 'click', FIX.horizontalNavDropDownForceOn[j]);
                }(lis[j], i, j));
            }
        }
    }
};

FIX.fixEzine2LabelWidth = function() {
    var ezines2 = document.querySelectorAll('.EzineHorizontal'), // Fix only the horizontal Ezine2 blocks.
        ezine2,
        i,
        ilen,
        labels,
        label,
        offsetTop = [],
        j,
        jlen,
        width,
        maxWidth;

    if (!ezines2) {
        return;
    }
    for (i = 0, ilen = ezines2.length; i < ilen; i += 1) {
        ezine2 = ezines2[i];
        labels = ezine2.querySelectorAll('label');
        if (labels) {
            jlen = labels.length;
            maxWidth = 0;
            for (j = 0; j < jlen; j += 1) {
                label = labels[j];
                offsetTop[j] = label.offsetTop;
                label.style.width = 'auto'; // Remove previously set width.
                width = FIX.getBoxPropertyValue(label, 'width');
                maxWidth = (width > maxWidth) ? width : maxWidth; // Store the maximum width of a label.
            }

            // Check if labels are not on the same line.
            if (offsetTop[0] !== offsetTop[offsetTop.length -1]) {
                for (j = 0; j < jlen; j += 1) {
                    label = labels[j];
                    label.style.width = maxWidth + 1 + "px"; // Set the max width with a 1px buffer.
                }
            }
        }
    }
};

FIX.responsiveVideo = function() {
    var iframes,
        iframe,
        i,
        ilen,
        wrapper,
        parent,
        sibling;

    iframes = document.querySelectorAll('iframe');

    for (i = 0, ilen = iframes.length; i < ilen; i += 1) {
        iframe = iframes[i];
        if (/youtube\.com/.test(iframe.src)) {
            wrapper = document.createElement('div');
            wrapper.className = 'video-container';
            sibling = iframe.nextSibling;
            parent = iframe.parentNode;
            wrapper.appendChild(iframe);
            parent.insertBefore(wrapper, sibling);
        }
    }
};