require("./scrub-slideshow.js")();
require("./hover-overlay.js")();

var hoverSlideshow = require("./hover-slideshow.js");
hoverSlideshow.init(2000, 1000);

var portfolioFilter = require("./portfolio-filter");
portfolioFilter.init();
