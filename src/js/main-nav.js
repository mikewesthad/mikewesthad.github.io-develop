module.exports = MainNav;

function MainNav(loader) {
    this._loader = loader;
    this._$nav = $("#main-nav");
    this._$navLinks = this._$nav.find("a");
    this._$activeNav = this._$navLinks.find(".active"); 
    this._$navLinks.on("click", this._onNavClick.bind(this));
}

MainNav.prototype.setActiveFromUrl = function () {
    this._deactivate();
    var url = location.pathname;
    if (url === "/index.html" || url === "/") {
        this._activateLink(this._$navLinks.filter("#about-link"));
    }
    else if (url === "/work.html") {        
        this._activateLink(this._$navLinks.filter("#work-link"));
    }
};

MainNav.prototype._deactivate = function () {
    if (this._$activeNav.length) {
        this._$activeNav.removeClass("active");
        this._$activeNav = $();
    }
};

MainNav.prototype._activateLink = function ($link) {
    $link.addClass("active");
    this._$activeNav = $link;
};

MainNav.prototype._onNavClick = function (e) {
    e.preventDefault();
};

    // Close the nav. This only matters if we are on mobile
    this._$nav.collapse("hide");

    var $target = $(e.currentTarget);
    if ($target.is(this._$activeNav)) return;

    this._deactivate();
    this._activateLink($target);

    var url = $target.attr("href");
    this._loader.loadPage(url, {}, true);    
};