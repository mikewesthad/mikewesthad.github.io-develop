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

    var htmlFragmentUrl = $target.data("url");
    $content.empty();
    $content.load(htmlFragmentUrl, function (responseText, textStatus, jqXhr) {
        if (textStatus === "error") {
            alert("There was a problem loading the page.");
        }
    });
}