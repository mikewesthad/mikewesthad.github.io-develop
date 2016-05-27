module.exports = {
    init: init
};

var navLinkSelector = "#main-nav a";
var activeNavLinkSelector = navLinkSelector + ".active";
var contentContainerSelector = "#content";
var $content;
var $activeNavItem;

function init() {
    $content = $(contentContainerSelector);
    $activeNavItem = $(activeNavLinkSelector);
    $(navLinkSelector).on("click", onNavClick);
}

function onNavClick(e) {
    e.preventDefault();
    var $target = $(e.currentTarget);
    if ($target.is($activeNavItem)) return;
    if ($activeNavItem.length) $activeNavItem.removeClass("active");
    $target.addClass("active");
    $activeNavItem = $target;
    var pageName = $target.data("page-name");
    loadPage(pageName);    
}

function loadPage(pageName) {
    var url = "html-pages/" + pageName + ".html";
    var fadeDuration = 200;

    // Fade then empty the current contents
    $content.fadeOut(fadeDuration, function () {
       $content.empty();
       $content.load(url, onContentFetched);
    });

    // Fade the new content in after it has been fetched
    function onContentFetched(responseText, textStatus, jqXhr) {
        if (textStatus === "error") {
            alert("There was a problem loading the page.");
            return;
        }

        $content.fadeIn(fadeDuration);

        // If the page needs any specific JS functionality, load it
        if (pageName === "work") {                
            require("./scrub-slideshow.js")();
            require("./hover-overlay.js")();

            var hoverSlideshow = require("./hover-slideshow.js");
            hoverSlideshow.init(2000, 1000);

            var portfolioFilter = require("./portfolio-filter.js");
            portfolioFilter.init();
        }
    }
}