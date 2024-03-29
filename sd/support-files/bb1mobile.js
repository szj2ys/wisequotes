var BB1MOBILE = {};

if (!BB1MOBILE.enabled) {
    BB1MOBILE.enabled = /mobileTrial=1/.test(document.cookie);
}

BB1MOBILE.navButtonLabel = 'Menu';

BB1MOBILE.hasClass = function (el, className) {
    var regexp = new RegExp("(^|\\s)" + className + "(\\s|$)");
    return regexp.test(el.className);
};

BB1MOBILE.addClass = function (el, className) {
    if (!BB1MOBILE.hasClass(el, className)) {
        el.className = el.className + " " + className;
    }
};

BB1MOBILE.removeClass = function (el, className) {
    var re = new RegExp("(^|\\s)" + className + "(\\s|$)");
    while (re.test(el.className)) { // in case multiple occurrences
        el.className = el.className.replace(re, ' ');
    }
    el.className = el.className.replace(/^\s+/, '').replace(/\s+$/, '');
};

BB1MOBILE.isMobile = function () {
    BB1MOBILE.androidMobile = (/Android/i.test(navigator.userAgent) && (/Mobile/i.test(navigator.userAgent)));
    if (BB1MOBILE.androidMobile) {
        if ((screen.width > 1000) && (screen.height > 550)) {
            BB1MOBILE.androidMobile = false; // Exclude tablets that identifies themselves as 'Mobile'
        }
    }
    return (/iPhone|iPod|BlackBerry/i.test(navigator.userAgent) || BB1MOBILE.androidMobile);
};

BB1MOBILE.addCSS = function () {
    var head = document.querySelector('head');
    var body = document.querySelector('body');
    var viewport = document.createElement('meta');
    var css = document.createElement('link');

    viewport.name = 'viewport';
    viewport.content = 'width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1';
    css.href = '/sd/support-files/bb1mobile.css';
    css.rel = 'stylesheet';
    css.type = 'text/css';
    
    body.className = body.className + " bb1mobile";

    head.appendChild(viewport);
    head.appendChild(css);
};

BB1MOBILE.setHeaderHeight = function () {
    var header = document.getElementById("Header");
    var headerLiner = header.querySelector(".Liner");
    var headerLinerBgUrl = window.getComputedStyle(headerLiner, null).getPropertyValue("background-image");
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
    window.addEventListener("resize", onResize, true);
};

BB1MOBILE.mobileNav = function() {
    var navWrapper = document.querySelector('.Navigation');
    if (!navWrapper) {
        return;
    }
    var nav = navWrapper.querySelector('ul');
    if (!nav) {
        return;
    }
    var button = document.createElement('div');
    button.className = 'mobileNavButtonWrapper';
    button.innerHTML = '<span class="mobileNavButton">' + BB1MOBILE.navButtonLabel + '</span>';
    navWrapper.insertBefore(button, navWrapper.firstChild);

    function toggleNav() {
        if (BB1MOBILE.hasClass(navWrapper, 'NavigationHidden')) {
            BB1MOBILE.removeClass(navWrapper, 'NavigationHidden');
        } else {
            BB1MOBILE.addClass(navWrapper, 'NavigationHidden');
        }
    }
    button.addEventListener('click', toggleNav, true);
    toggleNav();
};

BB1MOBILE.switchColumns = function() {
    var contentColumn = document.querySelector('#ContentColumn');
    var navColumn = document.querySelector('#NavColumn');
    var extraColumn = document.querySelector('#ExtraColumn');

    // Move ExtraColumn after ContentColumn (ECN, NEC, ENC).
    if (extraColumn && contentColumn.previousElementSibling &&
        (
        (contentColumn.previousElementSibling.id === 'ExtraColumn') || // NEC
        (
        contentColumn.previousElementSibling.previousElementSibling && // ENC
        (contentColumn.previousElementSibling.previousElementSibling.id === 'ExtraColumn')
        )
        )
    ) {
        contentColumn.parentNode.insertBefore(contentColumn, extraColumn);
    }

    // Move NavColumn before ContentColumn (CEN, CNE, CN)
    if (navColumn && contentColumn.nextElementSibling &&
        (
        (contentColumn.nextElementSibling.id === 'NavColumn') || // (E)CN
        (
        contentColumn.nextElementSibling.nextElementSibling && // CEN
        (contentColumn.nextElementSibling.id === 'ExtraColumn') &&
        (contentColumn.nextElementSibling.nextElementSibling.id === 'NavColumn')
        )
        )
    ) {
        contentColumn.parentNode.insertBefore(navColumn, contentColumn);
    }
};

BB1MOBILE.init = function (config) {
    if (!BB1MOBILE.enabled) {
        return;
    }
    config = config || {};
    if (BB1MOBILE.isMobile()) {
        BB1MOBILE.addCSS();
        if (config.navButtonLabel !== undefined) {
            BB1MOBILE.navButtonLabel = config.navButtonLabel;
        }
        document.addEventListener("DOMContentLoaded", function() {
            BB1MOBILE.switchColumns();
            if (config.responsive === undefined) {
                BB1MOBILE.setHeaderHeight();
            }
            BB1MOBILE.mobileNav();
        });
    }
};