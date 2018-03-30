module.exports = Sketch;

var BboxText = require("p5-bbox-aligned-text");
var BaseLogoSketch = require("./base-logo-sketch.js");

var utils = require("../utilities.js");

Sketch.prototype = Object.create(BaseLogoSketch.prototype);

function Sketch($nav, $navLogo) {
  BaseLogoSketch.call(this, $nav, $navLogo, "../fonts/big_john-webfont.ttf");
}

Sketch.prototype._onResize = function(p) {
  BaseLogoSketch.prototype._onResize.call(this, p);
  this._spacing = utils.map(this._fontSize, 20, 40, 2, 5, {
    clamp: true,
    round: true
  });
  // Update the bboxText, place over the nav text logo and then shift its
  // anchor back to (center, center) while preserving the text position
  this._bboxText
    .setText(this._text)
    .setTextSize(this._fontSize)
    .setAnchor(BboxText.ALIGN.BOX_LEFT, BboxText.BASELINE.ALPHABETIC)
    .setPosition(this._textOffset.left, this._textOffset.top)
    .setAnchor(BboxText.ALIGN.BOX_CENTER, BboxText.BASELINE.BOX_CENTER, true);
  this._drawStationaryLogo(p);
  this._calculateCircles(p);
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

  // Draw the stationary logo
  this._drawStationaryLogo(p);

  this._calculateCircles(p);
};

Sketch.prototype._calculateCircles = function(p) {
  // TODO: Don't need ALL the pixels. This could have an offscreen renderer
  // that is just big enough to fit the text.
  // Loop over the pixels in the text's bounding box to sample the word
  var bbox = this._bboxText.getBbox();
  var startX = Math.floor(Math.max(bbox.x - 5, 0));
  var endX = Math.ceil(Math.min(bbox.x + bbox.w + 5, p.width));
  var startY = Math.floor(Math.max(bbox.y - 5, 0));
  var endY = Math.ceil(Math.min(bbox.y + bbox.h + 5, p.height));
  p.loadPixels();
  p.pixelDensity(1);
  this._circles = [];
  for (var y = startY; y < endY; y += this._spacing) {
    for (var x = startX; x < endX; x += this._spacing) {
      var i = 4 * (y * p.width + x);
      var r = p.pixels[i];
      var g = p.pixels[i + 1];
      var b = p.pixels[i + 2];
      var a = p.pixels[i + 3];
      var c = p.color(r, g, b, a);
      if (p.saturation(c) > 0) {
        this._circles.push({
          x: x + p.random(-2 / 3 * this._spacing, 2 / 3 * this._spacing),
          y: y + p.random(-2 / 3 * this._spacing, 2 / 3 * this._spacing),
          color: p.color("#06FFFF")
        });
        this._circles.push({
          x: x + p.random(-2 / 3 * this._spacing, 2 / 3 * this._spacing),
          y: y + p.random(-2 / 3 * this._spacing, 2 / 3 * this._spacing),
          color: p.color("#FE00FE")
        });
        this._circles.push({
          x: x + p.random(-2 / 3 * this._spacing, 2 / 3 * this._spacing),
          y: y + p.random(-2 / 3 * this._spacing, 2 / 3 * this._spacing),
          color: p.color("#FFFF04")
        });
      }
    }
  }
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

  // Clear
  p.blendMode(p.BLEND);
  p.background(255);

  // Draw "halftone" logo
  p.noStroke();
  p.blendMode(p.MULTIPLY);

  var maxDist = this._bboxText.halfWidth;
  var maxRadius = 2 * this._spacing;

  for (var i = 0; i < this._circles.length; i += 1) {
    var circle = this._circles[i];
    var c = circle.color;
    var dist = p.dist(circle.x, circle.y, p.mouseX, p.mouseY);
    var radius = utils.map(dist, 0, maxDist, 1, maxRadius, { clamp: true });
    p.fill(c);
    p.ellipse(circle.x, circle.y, radius, radius);
  }
};
