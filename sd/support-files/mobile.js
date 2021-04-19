var MOBILE = MOBILE || {};

MOBILE.viewMode = "full"; // or "mobile"
MOBILE.deviceType = "other"; // or "mobile"
MOBILE.currentSection = "content"; // or "navigation"
MOBILE.orientation = ""; // "landscape" or "portrait"
MOBILE.toolbarFactor = 0;
MOBILE.mobileViewHeight = 0;
MOBILE.footerHeight = 0;
MOBILE.userAgent = "";
MOBILE.toolbarEl = null;
MOBILE.toolbarInnerWrapperEl = null;
MOBILE.mobileBtnEl = null;
MOBILE.navBtnEl = null;
MOBILE.toTopBtnEl = null;
MOBILE.enabled = false;
MOBILE.contentColumnWidth = 0;

MOBILE.hasCookie = function (key, value) {
    var regexp = new RegExp(key + '=' + value);
    return regexp.test(document.cookie);
};

MOBILE.checkIfMobile = function() {
    if (!MOBILE.enabled) {
        MOBILE.enabled = /mobileTrial=1/.test(document.cookie);
    }
    MOBILE.userAgent = navigator.userAgent;
    // without "Mobile" it would be a tablet, which is not our target device yet
    var androidMobile = (/Android/i.test(MOBILE.userAgent) && (/Mobile/i.test(MOBILE.userAgent)));
    if (androidMobile) {
        if ((screen.width > 1000) && (screen.height > 550)) {
            androidMobile = false; // Exclude tablets that identifies themselves as 'Mobile'
        }
    }
    // these are our target mobile devices
    if (MOBILE.enabled && ((/iPhone|iPod|BlackBerry/i.test(MOBILE.userAgent) && (!/iPad/i.test(MOBILE.userAgent))) || androidMobile)) {
        MOBILE.deviceType = "mobile";
        document.documentElement.className += " m";
        if (MOBILE.hasCookie("fullView", 'true')) { // full site view
            document.documentElement.className += " fullView";
            MOBILE.viewMode = "full";
        } else { // mobile view
            document.documentElement.className += " mobile";
            MOBILE.viewMode = "mobile";
        }
        if (MOBILE.userAgent.match(/Android 2/i)) { // Android 2.x fix
            document.documentElement.className += " android2";
        }
    }
};

MOBILE.changeViewMode = function(mode) {
    if (mode === "full") { // change to full site view
        document.cookie = "fullView=true";
        window.location.reload();
    } else if (mode === "mobile") { // change to mobile view
        document.cookie = "fullView=false";
        window.location.reload();
    }
};

MOBILE.setHeaderHeight = function() {
    var header = document.getElementById("Header");
    var headerLiner = header.querySelector(".Liner");
    var headerLinerBgUrl = window.getComputedStyle(headerLiner, null).getPropertyValue("background-image");
    if (headerLinerBgUrl === 'none') {
        return;
    }
    var phantomHeaderImage = document.createElement("img");
    var newHeight = 0;
    phantomHeaderImage.src = headerLinerBgUrl.replace(/^url\(["']?/, '').replace(/["']?\)$/, ' ');
    phantomHeaderImage.className = "phantomHeaderImage";
    phantomHeaderImage.width = header.offsetWidth;
    header.appendChild(phantomHeaderImage);

    var readNewHeight = function() {
        newHeight = phantomHeaderImage.offsetHeight - 3;
        if (newHeight > 0) {
            headerLiner.style.minHeight = newHeight + "px";
            headerLiner.style.height = "auto";
            if (MOBILE.viewMode === "mobile") {
                MOBILE.setFooterPosition();
            }
        }
    };

    if (phantomHeaderImage.complete) {
        readNewHeight();
    } else {
        phantomHeaderImage.onload = function() {
            readNewHeight();
        }
    }

    var onResize = function() {
        phantomHeaderImage.width = header.offsetWidth;
        readNewHeight();
    };
    if (MOBILE.viewMode === "mobile") {
        window.addEventListener("resize", onResize, true);
    }
};

MOBILE.fullBtnText = MOBILE.fullBtnText || 'Full Site';
MOBILE.mobileBtnText = MOBILE.mobileBtnText || 'View Mobile Site';
MOBILE.navBtnText = MOBILE.navBtnText || 'Navigation';
MOBILE.toTopBtnText = MOBILE.toTopBtnText || 'Back to Top';

MOBILE.addToolbars = function() {
    var body = document.getElementsByTagName("body")[0];
    var pageWrapper = document.getElementById("PageWrapper");
    var navColumnEl = document.getElementById("NavColumn");
    var toolbarEl = document.createElement("div");
    var toolbarInnerWrapperEl = document.createElement("div");
    toolbarEl.setAttribute("id", "toolbar");
    toolbarInnerWrapperEl.setAttribute("id", "toolbarInnerWrapper");
    toolbarInnerWrapperEl.innerHTML = '<button id="fullBtn">'+MOBILE.fullBtnText+'</button>' +
        '<button id="mobileBtn">'+MOBILE.mobileBtnText+'</button>' +
        '<button id="navBtn">'+MOBILE.navBtnText+'</button>' +
        '<button id="toTopBtn">'+MOBILE.toTopBtnText+'</button>';
    toolbarEl.appendChild(toolbarInnerWrapperEl);
    body.insertBefore(toolbarEl, pageWrapper);
    MOBILE.toolbarEl = toolbarEl;
    MOBILE.toolbarInnerWrapperEl = toolbarInnerWrapperEl;

    if (MOBILE.viewMode === "full") { // avoid flickering on start
        toolbarEl.style.display = "none";
    }

    var fullBtnEl = document.getElementById("fullBtn");
    var mobileBtnEl = document.getElementById("mobileBtn");
    var navBtnEl = document.getElementById("navBtn");
    var toTopBtnEl = document.getElementById("toTopBtn");
    MOBILE.mobileBtnEl = mobileBtnEl;
    MOBILE.navBtnEl = navBtnEl;
    MOBILE.toTopBtnEl = toTopBtnEl;

    fullBtnEl.onclick = function() { // change to full view
        MOBILE.changeViewMode("full");
    };

    mobileBtnEl.onclick = function() { // change to mobile view
        MOBILE.changeViewMode("mobile");
    };

    navBtnEl.onclick = function() { // scroll to nav
        MOBILE.scrollTo(navColumnEl.offsetTop - 35); // 35 = toolbar height
        MOBILE.switchButton("top");
    };

    toTopBtnEl.onclick = function() { // scroll to top
        MOBILE.scrollTo(0);
        MOBILE.switchButton("nav");
    };
};

MOBILE.resizeToolbar = function() {
    var horizontalSpace = screen.width;
    var dpr = 1;
    if (window.devicePixelRatio !== undefined) {
        dpr = window.devicePixelRatio;
    }

    // buggy screen width fix (iPhone and Android Chrome)
    if (MOBILE.userAgent.match(/iPhone/i) || (MOBILE.userAgent.match(/Android/i) && MOBILE.userAgent.match(/Chrome/i))) {
        if ((window.orientation === 90) || (window.orientation === -90)) { // if in landscape mode
            horizontalSpace = screen.height;
        }
    }

    // Prevent the button from being too large when a page is zoomed out.
    var toolbarFactor = window.innerWidth / (horizontalSpace / dpr);
    if (toolbarFactor > 3) {
        toolbarFactor = 3;
    }

    if (toolbarFactor !== MOBILE.toolbarFactor) {
        MOBILE.toolbarFactor = toolbarFactor;

        var newPadding = 2 * toolbarFactor;
        newPadding = newPadding.toFixed(2) + "px";
        var newFontSize = 12 * toolbarFactor;
        newFontSize = newFontSize.toFixed(2) + "px";

        //MOBILE.mobileBtnEl.innerHTML = "iw = " + window.innerWidth + " hs = " + horizontalSpace + " dpr = " + dpr + " f = " + toolbarFactor.toFixed(2);

        MOBILE.mobileBtnEl.style.fontSize = newFontSize;
        MOBILE.toolbarEl.style.padding = newPadding;
        MOBILE.toolbarEl.style.display = "block";
    }
};

MOBILE.refreshToolbar = function() {
    MOBILE.toolbarEl.style.display = "none";
    setTimeout(function() {
        MOBILE.toolbarEl.style.display = "block";
        MOBILE.toolbarInnerWrapperEl.style.width = window.innerWidth + "px"; // display:table fix
    }, 500);
};

MOBILE.detectCurrentSection = function() {
    var navColumnEl = document.getElementById("NavColumn");
    if (!navColumnEl) {
        return;
    }
    var navColumnTopPosition = navColumnEl.offsetTop;
    if ((navColumnTopPosition - window.pageYOffset - window.innerHeight) < 0) {
        if (MOBILE.currentSection === "content") {
            MOBILE.switchButton("top");
            MOBILE.currentSection = "navigation";
        }
    } else {
        if (MOBILE.currentSection === "navigation") {
            MOBILE.switchButton("nav");
            MOBILE.currentSection = "content";
        }
    }
};

MOBILE.switchButton = function(targetBtn) {
    if (targetBtn === "top") {
        MOBILE.navBtnEl.style.display = "none";
        MOBILE.toTopBtnEl.style.display = "inline-block";
    } else { // navigation
        MOBILE.toTopBtnEl.style.display = "none";
        MOBILE.navBtnEl.style.display = "inline-block";
    }
};

MOBILE.scrollTo = function(y) {
    var body = document.getElementsByTagName("body")[0];
    var div = document.createElement("div");
    div.className = "iosbtnfix";
    body.appendChild(div);
    window.scrollTo(0, y);
    setTimeout(function() {
        body.removeChild(document.querySelectorAll(".iosbtnfix")[0]);
    }, 500);
};

MOBILE.orientationMarker = function() {
    if ((window.orientation === 90) || (window.orientation === -90)) { // if in landscape mode
        document.documentElement.className = document.documentElement.className.replace(/(^|\s+)portrait(\s+|$)/, ' ');
        document.documentElement.className += " landscape";
        MOBILE.orientation = "landscape";
    } else { // portrait
        document.documentElement.className = document.documentElement.className.replace(/(^|\s+)landscape(\s+|$)/, ' ');
        document.documentElement.className += " portrait";
        MOBILE.orientation = "portrait";
    }
};

MOBILE.setFooterPosition = function() {
    var footerEl = document.getElementById("Footer");
    var NavColumnEl = document.getElementById("NavColumn");
    var ExtraColumnEl = document.getElementById("ExtraColumn");

    if (!NavColumnEl && !ExtraColumnEl) {
        return;
    }

    var mobileViewHeight = NavColumnEl.offsetTop - parseInt(window.getComputedStyle(NavColumnEl, null).getPropertyValue("margin-top"), 10);

    var footerHeight = footerEl.offsetHeight;

    if (mobileViewHeight !== MOBILE.mobileViewHeight) {
        footerEl.style.top = mobileViewHeight + "px";
        MOBILE.mobileViewHeight = mobileViewHeight;
    }

    if (footerHeight !== MOBILE.footerHeight) {
        NavColumnEl.style.marginTop = footerHeight + "px";
        if (ExtraColumnEl) {
            ExtraColumnEl.style.marginTop = footerHeight + "px";
        }
        MOBILE.footerHeight = footerHeight;
    }
};

MOBILE.fixImageProportions = function() {
    MOBILE.contentColumnWidth = parseInt(MOBILE.contentColumnWidth);
    if (MOBILE.contentColumnWidth > 300) {
        var images = document.querySelectorAll("#ContentColumn .Liner > .ItemCenter > img, #ContentColumn .Liner > .ItemLeft > img, #ContentColumn .Liner > .ItemRight > img, #ContentColumn .Liner > .ImageBlock > img, #ContentColumn .Liner > .ItemCenter > a > img, #ContentColumn .Liner > .ItemLeft > a > img, #ContentColumn .Liner > .ItemRight > a > img, #ContentColumn .Liner > .ImageBlock > a > img, #ContentColumn .Liner > .ImageBlock > .noalignment > a > img, #ContentColumn .Liner > .ImageBlock > .noalignment > img");
        var width = 0;
        var originalAttributeWidth = 0;
        var borderLeft = 0;
        var borderRight = 0;
        var marginLeft = 0;
        var marginRight = 0;
        var newWidth;
        var parent = null;
        var noalignmentNode = null;
        var captionEl = null;

        function setPercentageWidth(img) {
            borderLeft = parseInt(window.getComputedStyle(img, null).getPropertyValue("border-left-width"), 10);
            borderRight = parseInt(window.getComputedStyle(img, null).getPropertyValue("border-right-width"), 10);
            marginLeft = parseInt(window.getComputedStyle(img, null).getPropertyValue("margin-left"), 10);
            marginRight = parseInt(window.getComputedStyle(img, null).getPropertyValue("margin-right"), 10);

            captionEl = img.parentNode.getElementsByClassName("Caption")[0];

            // read original attribute width saved by fix.js
            originalAttributeWidth = img.getAttribute("data-width");
            if (originalAttributeWidth) {
                width = parseInt(originalAttributeWidth, 10);
            }
            else {
                width = img.naturalWidth;
            }
            if (width === 0) {
                return;
            }
            if (width < MOBILE.contentColumnWidth) {
                newWidth = ((width + borderLeft + borderRight) / MOBILE.contentColumnWidth) * 100;
                newWidth = newWidth.toFixed(2) + "%";
                parent = img.parentNode;
                if (parent.tagName === "A") {
                    parent = parent.parentNode;
                }
                if (parent.className === "noalignment") {
                    noalignmentNode = parent;
                    parent = parent.parentNode;
                }
                if (parent.className.match(/ItemLeft|ItemRight|ImageBlockLeft|ImageBlockRight/i)) {
                    parent.style.width = newWidth;
                    if (marginLeft > 0) {
                        img.style.marginLeft = 0;
                        if (captionEl) {
                            captionEl.style.marginLeft = 0;
                        }
                        parent.style.paddingLeft = marginLeft + "px";
                    }
                    if (marginRight > 0) {
                        img.style.marginRight = 0;
                        if (captionEl) {
                            captionEl.style.marginRight = 0;
                        }
                        parent.style.paddingRight = marginRight + "px";
                    }
                    if (captionEl) {
                        captionEl.style.width = "100%";
                        captionEl.style.maxWidth = '100%';
                    }
                    img.setAttribute("width", "100%");
                } else {
                    img.setAttribute("width", newWidth);
                    if (captionEl) {
                        captionEl.style.width = newWidth;
                        if (parent.className.match(/ItemCenter|ImageBlockCenter/i)) {
                            captionEl.style.marginLeft = "auto";
                            captionEl.style.marginRight = "auto";
                        }
                    }
                    if (noalignmentNode) {
                        noalignmentNode.style.width = "100%";
                    }
                }
            }
        }

        for (var i = 0, ilen = images.length; i < ilen; i++) {
            var widthAttribute = images[i].getAttribute("width");
            if ((widthAttribute !== null) && (widthAttribute[widthAttribute.length - 1] === "%")) {
                // skip images that already uses percentage width values
                continue;
            }
            (function(img) {
                if(img.complete) {
                    setPercentageWidth(img);
                } else {
                    img.onload = function() {
                        setPercentageWidth(img);
                    }
                }
            }(images[i]));
        }
    }
};

MOBILE.fixAdAlignment = function() {
    var ads;
    var i, ilen;

    ads = document.querySelectorAll("#ContentColumn .wasAdSenseBoxLeft");
    for (i = 0, ilen = ads.length; i < ilen; i++) {
        ads[i].className = ads[i].className.replace(/(^|\s+)wasAdSenseBoxLeft(\s+|$)/, ' ');
        ads[i].className += " AdSenseBoxLeft";
    }
    ads = document.querySelectorAll("#ContentColumn .wasAdSenseBoxRight");
    for (i = 0, ilen = ads.length; i < ilen; i++) {
        ads[i].className = ads[i].className.replace(/(^|\s+)wasAdSenseBoxRight(\s+|$)/, ' ');
        ads[i].className += " AdSenseBoxRight";
    }

    ads = document.querySelectorAll("#ContentColumn .AdSenseBoxLeft, #ContentColumn .AdSenseBoxRight");
    for (i = 0, ilen = ads.length; i < ilen; i++) {
        if ((ads[i].clientWidth / MOBILE.viewportWidth()) > 0.6) {
            if (/(^|\s)AdSenseBoxLeft(\s|$)/.test(ads[i].className)) {
                ads[i].className = ads[i].className.replace(/(^|\s+)AdSenseBoxLeft(\s+|$)/, ' ');
                ads[i].className += " wasAdSenseBoxLeft";
            } else if (/(^|\s)AdSenseBoxRight(\s|$)/.test(ads[i].className)) {
                ads[i].className = ads[i].className.replace(/(^|\s+)AdSenseBoxRight(\s+|$)/, ' ');
                ads[i].className += " wasAdSenseBoxRight";
            }
            ads[i].style.textAlign = "center";
            ads[i].style.clear = "both";
        }
    }
};

MOBILE.startLoop = function(f, options) {
    var counter = 0;
    var max = options.max || 120;
    var delay = options.delay || 500;
    var loop = function() {
        counter++;
        if (counter > max) {
            if (typeof options.callback !== 'undefined') {
                options.callback();
            }
            return;
        }
        f();
        setTimeout(function() {
            loop();
        }, delay);
    };
    loop();
};

MOBILE.doOnOrientationChange = function() {
    MOBILE.orientationMarker();
    MOBILE.startLoop(MOBILE.setFooterPosition, {max: 5, delay: 100});
    MOBILE.refreshToolbar();
    MOBILE.startLoop(MOBILE.fixImageProportions, {max: 2, delay: 1500});
    MOBILE.startLoop(MOBILE.fixAdAlignment, {max: 2, delay: 1500});
};

MOBILE.removeDesktopOnly = function() {
    var desktopOnlyItems = document.querySelectorAll(".desktopOnly");
    for (var i = 0, ilen = desktopOnlyItems.length; i < ilen; i++) {
        var desktopOnlyItem = desktopOnlyItems[i];
        desktopOnlyItem.parentNode.removeChild(desktopOnlyItem);
    }
};

MOBILE.init = function() {
    MOBILE.checkIfMobile();
    if (MOBILE.viewMode === "mobile") {
        document.write('<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1">');
    }
};

MOBILE.doEndOfHead = function() {
    if (typeof mobileSandBox !== 'undefined') {
        MOBILE.enabled = true;
        MOBILE.init();
    }
};

MOBILE.doAfterHeader = function() {
    if (MOBILE.viewMode === "mobile") {
        MOBILE.setHeaderHeight();
    }
};

MOBILE.doEndOfBody = function() {
    if (MOBILE.deviceType === "mobile") {
        MOBILE.addToolbars();
        if (MOBILE.userAgent.match(/BlackBerry|Android 2/i)) {
            // for the devices that don't support position:fixed
            MOBILE.toolbarEl.style.position = "absolute";
            window.addEventListener ("scroll", function() { MOBILE.toolbarEl.style.top = window.scrollY + 'px'; }, false);
        }
        if (MOBILE.viewMode === "full") {
            setInterval(MOBILE.resizeToolbar, 100);
            window.addEventListener ("resize", MOBILE.resizeToolbar, false);
        } else { // mobile view
            MOBILE.orientationMarker();
            window.addEventListener ("orientationchange", MOBILE.doOnOrientationChange, false);
            if (!MOBILE.userAgent.match(/iPhone/i)) {
                window.addEventListener ("resize", MOBILE.refreshToolbar, false);
            }
            MOBILE.setFooterPosition();
            MOBILE.startLoop(MOBILE.setFooterPosition, {max: 960, delay: 500});
            window.addEventListener ("scroll", MOBILE.detectCurrentSection, false);
            MOBILE.removeDesktopOnly();
            MOBILE.fixImageProportions();
            MOBILE.fixAdAlignment();
        }
        // hide side columns on msb.html page
        if (typeof mobileSandBox !== 'undefined') {
            var navColumnEl = document.getElementById("NavColumn");
            var extraColumnEl = document.getElementById("ExtraColumn");
            if (navColumnEl) {
                navColumnEl.style.display = "none";
            }
            if (extraColumnEl) {
                extraColumnEl.style.display = "none";
            }
        }
    }
};

MOBILE.viewportWidth = function() {
    var viewportWidth;
    // browsers
    if (typeof window.innerWidth != "undefined") {
        viewportWidth = window.innerWidth;
    }
    // IE standard compliant mode
    else if (typeof document.documentElement != "undefined"
        && typeof document.documentElement.offsetWidth != "undefined"
        && document.documentElement.offsetWidth != 0) {
        viewportWidth = document.documentElement.offsetWidth;
    }
    // IE quirks mode
    else {
        viewportWidth = document.getElementsByTagName('body')[0].offsetWidth;
    }
    return viewportWidth;
};

MOBILE.updateValues = function(client,slot,width,height) {
    var ins = document.getElementsByTagName("ins");
    for (var i=0, insLen=ins.length; i<insLen; i++) {
        var elem = ins[i];
        if (/adsbygoogle/.test(elem.className)) {	// checking classname in case there are more <ins> tags in the code
            break;
        }
    }
    if (!elem) {
        throw new Error("INS tag with class name 'adsbygoogle' is absent in the code");
    }
    elem.style.width = width+'px';
    elem.style.height = height+'px';
    elem.setAttribute('data-ad-client',client);
    elem.setAttribute('data-ad-slot',slot);
};
