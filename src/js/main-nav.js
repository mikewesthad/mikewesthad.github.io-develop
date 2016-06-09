module.exports = MainNav;

function MainNav(loader) {
    this._loader = loader;
    this._$navLinks = $("#main-nav a");
    this._$activeNav = this._$navLinks.find(".active"); 
    this._$navLinks.on("click", this._onNavClick.bind(this));
}

MainNav.prototype.setActiveFromUrl = function () {
    var url = location.pathname;
    if (url === "/index.html" || url === "/") {
        this._activateLink(this._$navLinks.filter("#about-link"));
    }
    else if (url === "/work.html") {        
        this._activateLink(this._$navLinks.filter("#work-link"));
    }
};

MainNav.prototype._activateLink = function ($link) {
    if (this._$activeNav.length) this._$activeNav.removeClass("active");
    $link.addClass("active");
    this._$activeNav = $link;
};

MainNav.prototype._onNavClick = function (e) {
    e.preventDefault();

    var $target = $(e.currentTarget);
    if ($target.is(this._$activeNav)) return;

    this._activateLink($target);

    var url = $target.attr("href");
    this._loader.loadPage(url, {}, true);    
};