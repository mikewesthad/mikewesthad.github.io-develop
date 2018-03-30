module.exports = Sketch;

var Noise = require("./generators/noise-generators.js");
var BboxText = require("p5-bbox-aligned-text");
var BaseLogoSketch = require("./base-logo-sketch.js");

Sketch.prototype = Object.create(BaseLogoSketch.prototype);

function Sketch($nav, $navLogo) {
  BaseLogoSketch.call(this, $nav, $navLogo, "../fonts/big_john-webfont.ttf");
}

Sketch.prototype._onResize = function(p) {
  BaseLogoSketch.prototype._onResize.call(this, p);
  // Update the bboxText, place over the nav text logo and then shift its
  // anchor back to (center, center) while preserving the text position
  this._bboxText
    .setText(this._text)
    .setTextSize(this._fontSize)
    .setRotation(0)
    .setAnchor(BboxText.ALIGN.BOX_LEFT, BboxText.BASELINE.ALPHABETIC)
    .setPosition(this._textOffset.left, this._textOffset.top)
    .setAnchor(BboxText.ALIGN.BOX_CENTER, BboxText.BASELINE.BOX_CENTER, true);
  this._textPos = this._bboxText.getPosition();
  this._drawStationaryLogo(p);
  this._isFirstFrame = true;
};

Sketch.prototype._drawStationaryLogo = function(p) {
  p.background(255);
  p.stroke(255);
  p.fill("#0A000A");
  p.strokeWeight(2);
  this._bboxText.draw();
};

Sketch.prototype._setup = function(p) {
  BaseLogoSketch.prototype._setup.call(this, p);

  // Create a BboxAlignedText instance that will be used for drawing and
  // rotating text
  this._bboxText = new BboxText(this._font, this._text, this._fontSize, 0, 0, p);

  // Handle the initial setup by triggering a resize
  this._onResize(p);

  // Set up noise generators
  this._rotationNoise = new Noise.NoiseGenerator1D(p, -p.PI / 4, p.PI / 4, 0.02);
  this._xyNoise = new Noise.NoiseGenerator2D(p, -100, 100, -50, 50, 0.01, 0.01);
};

Sketch.prototype._draw = function(p) {
  BaseLogoSketch.prototype._draw.call(this, p);
  if (!this._isMouseOver || !this._isOverNavLogo) return;

  // When the text is about to become active for the first time, clear
  // the stationary logo that was previously drawn.
  if (this._isFirstFrame) {
    p.background(255);
    this._isFirstFrame = false;
  }

  // Calculate position and rotation to create a jittery logo
  var rotation = this._rotationNoise.generate();
  var xyOffset = this._xyNoise.generate();
  this._bboxText
    .setRotation(rotation)
    .setPosition(this._textPos.x + xyOffset.x, this._textPos.y + xyOffset.y)
    .draw();
};
