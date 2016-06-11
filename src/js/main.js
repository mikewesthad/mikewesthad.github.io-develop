var Loader = require("./page-loader.js");
var MainNav = require("./main-nav.js");
var HoverSlideshows = require("./hover-slideshow.js");
var PortfolioFilter = require("./portfolio-filter.js");
var ImageGalleries = require("./image-gallery.js");

// Picking a random sketch that the user hasn't seen before
var Sketch = require("./pick-random-sketch.js")();

// AJAX page loader, with callback for reloading widgets
var loader = new Loader(onPageLoad);

// Main nav widget
var mainNav = new MainNav(loader);

// Interactive logo in navbar
var nav = $("nav.navbar");
var navLogo = nav.find(".navbar-brand");
var sketch = new Sketch(nav, navLogo);

// Widget globals
var hoverSlideshows, portfolioFilter, imageGalleries;

// Load all widgets
onPageLoad();

// Handle back/forward buttons
window.addEventListener("popstate", onPopState);

function onPopState(e) {
    // Loader stores custom data in the state - including the url and the query
    var url = (e.state && e.state.url) || "/index.html";
    var queryObject = (e.state && e.state.query) || {};

    if ((url === loader.getLoadedPath()) && (url === "/work.html")) {
        // The current & previous loaded states were work.html, so just refilter
        var category = queryObject.category || "all";
        portfolioFilter.selectCategory(category);
    } else {
        // Load the new page
        loader.loadPage(url, {}, false);
    }
}

function onPageLoad() {
    // Reload all plugins/widgets
    hoverSlideshows = new HoverSlideshows();
    portfolioFilter = new PortfolioFilter(loader);
    imageGalleries = new ImageGalleries();
    objectFitImages();
    smartquotes();

    // Slightly redundant, but update the main nav using the current URL. This
    // is important if a page is loaded by typing a full URL (e.g. going
    // directly to /work.html) or when moving from work.html to a project. 
    mainNav.setActiveFromUrl();
}

// We've hit the landing page, load the about page
// if (location.pathname.match(/^(\/|\/index.html|index.html)$/)) {
//     loader.loadPage("/about.html", {}, false);
// }