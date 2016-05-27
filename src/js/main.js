var mainNav = require("./main-nav.js");
mainNav.init();

require("./scrub-slideshow.js")();
require("./hover-overlay.js")();

var hoverSlideshow = require("./hover-slideshow.js");
hoverSlideshow.init(2000, 1000);

var portfolioFilter = require("./portfolio-filter.js");
portfolioFilter.init();