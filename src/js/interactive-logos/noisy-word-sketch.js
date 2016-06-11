module.exports = Sketch;

var utils = require("../utilities.js");
var Noise = require("./generators/noise-generators.js");
var BboxText = require("p5-bbox-aligned-text");

var p;
var fontPath = "../fonts/big_john-webfont.ttf";

function Sketch($nav, $navLogo) {
    this._$nav = $nav;
    this._$navLogo = $navLogo;
    this._text = this._$navLogo.text();

    this._isFirstFrame = true;
    this._isMouseOver = false;

    this._font = null;
    this._p = null;
    this._$canvas = null;
    this._rotationNoise = null; 
    this._xyNoise = null;
    this._bboxText = null;

    this._updateSize();
    this._updateFontSize();

    // Create a (relative positioned) container for the sketch inside of the
    // nav, but make sure that it is BEHIND everything else. Eventually, we will
    // drop just the nav logo (not the nav links!) behind the canvas.
    this._$container = $("<div>")
        .css({
            position: "absolute",
            top: "0px",
            left: "0px",
            cursor: "pointer" // Make it look like a link :)
        })
        .prependTo(this._$nav)
        .hide();

    this._updateTextOffset();

    // Create a p5 instance
    new p5(function(p) {
        this._p = p;
        p.preload = this._preload.bind(this, p);
        p.setup = this._setup.bind(this, p);
        p.draw = this._draw.bind(this, p);
    }.bind(this), this._$container.get(0));
}

Sketch.prototype._updateTextOffset = function (p) {
    // Find the distance from the nav to the logo's baseline
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

Sketch.prototype._updateSize = function () {
    this._width = this._$nav.innerWidth();
    this._height = this._$nav.innerHeight();
};

Sketch.prototype._updateFontSize = function () {
    this._fontSize = this._$navLogo.css("fontSize").replace("px", "");
};

Sketch.prototype._onResize = function (p) {
    this._updateSize();
    this._updateFontSize();
    this._updateTextOffset();
    this._bboxText.setText(this._text);
    this._bboxText.setTextSize(this._fontSize);
    this._textOffset.top -= this._bboxText._distBaseToMid;
    this._textOffset.left += this._bboxText.halfWidth;
    p.resizeCanvas(this._width, this._height);    
    this._drawStationaryLogo(p);
    this._isFirstFrame = true;
};

Sketch.prototype._preload = function (p) {
    this._font = p.loadFont(fontPath);
};

Sketch.prototype._setMouseOver = function (isMouseOver) {
    this._isMouseOver = isMouseOver;
};

Sketch.prototype._onClick = function (e) {
    this._$navLogo.trigger(e);
};

Sketch.prototype._drawStationaryLogo = function (p) {
    p.background(255);
    p.stroke(255);
    p.fill("#0A000A");
    p.strokeWeight(2);
    this._bboxText.setRotation(0);
    this._bboxText.draw(this._textOffset.left, this._textOffset.top);
};

Sketch.prototype._setup = function (p) {
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

    // Create a BboxAlignedText instance that will be used for drawing and 
    // rotating text
    this._bboxText = new BboxText(this._font, this._text, this._fontSize, p);
    this._bboxText.setAnchor(BboxText.ALIGN.BOX_CENTER,
        BboxText.BASELINE.BOX_CENTER);

    // Handle the initial setup by triggering a resize
    this._onResize(p);

    // Set up noise generators
    this._rotationNoise = new Noise.NoiseGenerator1D(p, -p.PI/4, p.PI/4, 0.02); 
    this._xyNoise = new Noise.NoiseGenerator2D(p, -100, 100, -50, 50, 0.01, 
        0.01);
};


Sketch.prototype._draw = function (p) {
    if (!this._isMouseOver) return;

    // When the text is about to become active for the first time, clear
    // the stationary logo that was previously drawn. 
    if (this._isFirstFrame) {
        p.background(255);
        this._isFirstFrame = false;
    }

    // Calculate position and rotation to create a jittery logo
    var rotation = this._rotationNoise.generate();
    var xyOffset = this._xyNoise.generate();
    this._bboxText.setRotation(rotation);
    this._bboxText.draw(this._textOffset.left + xyOffset.x, 
        this._textOffset.top + xyOffset.y);
};