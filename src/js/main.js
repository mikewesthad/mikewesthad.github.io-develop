var Loader = require("./page-loader.js");
var MainNav = require("./main-nav.js");
var HoverSlideshow = require("./hover-slideshow.js");
var PortfolioFilter = require("./portfolio-filter.js");
var ImageGallery = require("./image-gallery.js");

var hoverSlideshow, portfolioFilter;

var loader = new Loader(onPageLoad);

var mainNav = new MainNav(loader);
mainNav.setActiveFromUrl();

onPageLoad();

function onPageLoad() {
    hoverSlideshow = new HoverSlideshow();
    portfolioFilter = new PortfolioFilter(loader);
    ImageGallery.init();
    objectFitImages();
    smartquotes();
}


// We've hit the landing page, load the about page
// if (location.pathname.match(/^(\/|\/index.html|index.html)$/)) {
//     loader.loadPage("/about.html", {}, false);
// }

// -- POPSTATE -----------------------------------------------------------------

window.addEventListener("popstate", function (e) {
    var url = (e.state && e.state.url) || "/index.html";
    var queryObject = (e.state && e.state.query) || {};

    if ((url === loader.getLoadedPath()) && (url === "/work.html")) {
        var category = queryObject.category || "all";
        portfolioFilter.selectCategory(category);
    } else {
        loader.loadPage(url, {}, false);
    }
});