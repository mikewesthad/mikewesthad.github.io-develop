module.exports = BaseLogoSketch;

var utils = require("../utilities.js");

function BaseLogoSketch($nav, $navLogo, fontPath) {
    this._$nav = $nav;
    this._$navLogo = $navLogo;
    this._fontPath = fontPath;

    this._text = this._$navLogo.text();
    this._isFirstFrame = true;
    this._isMouseOver = false;
    this._isPointer = false;

    this._updateTextOffset();
    this._updateSize();
    this._updateFontSize();

    // Create a (relative positioned) container for the sketch inside of the
    // nav, but make sure that it is BEHIND everything else. Eventually, we will
    // drop just the nav logo (not the nav links!) behind the canvas.
    this._$container = $("<div>")
        .css({
            position: "absolute",
            top: "0px",
            left: "0px"
        })
        .prependTo(this._$nav)
        .hide();

    this._createP5Instance();
}

/**
 * Create a new p5 instance and bind the appropriate class methods to the
 * instance. This also fills in the p parameter on the class methods (setup,
 * draw, etc.) so that those functions can be a little less verbose :) 
 */
BaseLogoSketch.prototype._createP5Instance = function () {
    new p5(function(p) {
        this._p = p;
        p.preload = this._preload.bind(this, p);
        p.setup = this._setup.bind(this, p);
        p.draw = this._draw.bind(this, p);
    }.bind(this), this._$container.get(0));
};

/**
 * Find the distance from the top left of the nav to the brand logo's baseline.
 */
BaseLogoSketch.prototype._updateTextOffset = function () {
    var baselineDiv = $("<div>")
        .css({
            display: "inline-block",
            verticalAlign: "baseline"
        }).prependTo(this._$navLogo);
    var navOffset = this._$nav.offset();
    var logoBaselineOffset = baselineDiv.offset();
    this._textOffset = {
        top: logoBaselineOffset.top - navOffset.top,
        left: logoBaselineOffset.left - navOffset.left
    };
    baselineDiv.remove();
};

/**
 * Find the bounding box of the brand logo in the nav. This bbox can then be 
 * used to control when the cursor should be a pointer.
 */
BaseLogoSketch.prototype._calculateNavLogoBounds = function () {
    var navOffset = this._$nav.offset();
    var logoOffset = this._$navLogo.offset();
    this._logoBbox = {
        y: logoOffset.top - navOffset.top,
        x: logoOffset.left - navOffset.left,
        w: this._$navLogo.outerWidth(), // Exclude margin from the bbox
        h: this._$navLogo.outerHeight() // Links aren't clickable on margin
    };
};

/**
 * Update the dimensions to match the nav - excluding any margin, padding & 
 * border.
 */
BaseLogoSketch.prototype._updateSize = function () {
    this._width = this._$nav.innerWidth();
    this._height = this._$nav.innerHeight();
};

/**
 * Grab the font size from the brand logo link. This makes the font size of the
 * sketch responsive.
 */
BaseLogoSketch.prototype._updateFontSize = function () {
    this._fontSize = this._$navLogo.css("fontSize").replace("px", "");
};

/**
 * When the browser is resized, recalculate all the necessary stats so that the
 * sketch can be responsive. The logo in the sketch should ALWAYS exactly match
 * the brang logo link the HTML.
 */
BaseLogoSketch.prototype._onResize = function (p) {
    this._updateSize();
    this._updateFontSize();
    this._updateTextOffset();
    this._calculateNavLogoBounds();
    p.resizeCanvas(this._width, this._height);
};

/**
 * Update the _isMouseOver property. 
 */
BaseLogoSketch.prototype._setMouseOver = function (isMouseOver) {
    this._isMouseOver = isMouseOver;
};

/**
 * If the cursor is set to a pointer, forward any click events to the nav logo.
 * This reduces the need for the canvas to do any AJAX-y stuff.
 */
BaseLogoSketch.prototype._onClick = function (e) {
    if (this._isPointer) this._$navLogo.trigger(e);
};

/**
 * Base preload method that just loads the necessary font
 */
BaseLogoSketch.prototype._preload = function (p) {
    this._font = p.loadFont(this._fontPath);
};

/**
 * Base setup method that does some heavy lifting. It hides the nav brand logo
 * and reveals the canvas. It also sets up a lot of the internal variables and
 * canvas events.
 */
BaseLogoSketch.prototype._setup = function (p) {
    var renderer = p.createCanvas(this._width, this._height);
    this._$canvas = $(renderer.canvas);

    // Show the canvas and hide the logo. Using show/hide on the logo will cause
    // jQuery to muck with the positioning, which is used to calculate where to
    // draw the canvas text. Instead, just push the logo behind the canvas. This
    // allows makes it so the canvas is still behind the nav links.
    this._$container.show();
    this._$navLogo.css("zIndex", -1);

    // There isn't a good way to check whether the sketch has the mouse over
    // it. p.mouseX & p.mouseY are initialized to (0, 0), and p.focused isn't 
    // always reliable.
    this._$canvas.on("mouseover", this._setMouseOver.bind(this, true));
    this._$canvas.on("mouseout", this._setMouseOver.bind(this, false));

    // Forward mouse clicks to the nav logo
    this._$canvas.on("click", this._onClick.bind(this));

    // When the window is resized, text & canvas sizing and placement need to be
    // recalculated. The site is responsive, so the interactive canvas should be
    // too! 
    $(window).on("resize", this._onResize.bind(this, p));
};

/**
 * Base draw method that controls whether or not the cursor is a pointer. It
 * should only be a pointer when the mouse is over the nav brand logo.
 */
BaseLogoSketch.prototype._draw = function (p) {
    if (this._isMouseOver) {
        var isOverLogo = utils.isInRect(p.mouseX, p.mouseY, this._logoBbox);
        if (!this._isPointer && isOverLogo) {
            this._isPointer = true;
            this._$canvas.css("cursor", "pointer");
        } else if (this._isPointer && !isOverLogo) {
            this._isPointer = false;
            this._$canvas.css("cursor", "initial");
        }
    }
};