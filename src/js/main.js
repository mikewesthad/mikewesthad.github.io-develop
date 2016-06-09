// -- ON INITIAL LOAD ----------------------------------------------------------

smartquotes();

var widgets = [];

var Loader = require("./page-loader.js");
var loader = new Loader(onReload);

var MainNav = require("./main-nav.js");
var mainNav = new MainNav(loader);

var HoverSlideshow = require("./hover-slideshow.js");
var hoverSlideshow = new HoverSlideshow();

var PortfolioFilter = require("./portfolio-filter.js");
var portfolioFilter = new PortfolioFilter(loader);

var ImageGallery = require("./image-gallery.js");
ImageGallery.init();

$(document).on("click", function (e) {
    hoverSlideshow.reload();
});

function onReload() {
    hoverSlideshow.reload();
    portfolioFilter = new PortfolioFilter(loader);
    ImageGallery.init();

}

mainNav.setActiveFromUrl();

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