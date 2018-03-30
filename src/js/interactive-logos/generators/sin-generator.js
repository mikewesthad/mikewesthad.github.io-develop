module.exports = SinGenerator;

var utils = require("../../utilities.js");

/**
 * A utility class for generating values along a sinwave
 * @constructor
 * @param {object} p               Reference to a p5 sketch
 * @param {number} [min=0]         Minimum value for the noise
 * @param {number} [max=1]         Maximum value for the noise
 * @param {number} [increment=0.1] Increment used when updating
 * @param {number} [offset=random] Where to start along the sinewave
 */
function SinGenerator(p, min, max, angleIncrement, startingAngle) {
  this._p = p;
  this._min = utils.default(min, 0);
  this._max = utils.default(max, 0);
  this._increment = utils.default(angleIncrement, 0.1);
  this._angle = utils.default(startingAngle, p.random(-1000000, 1000000));
}

/**
 * Update the min and max values
 * @param  {number} min Minimum value
 * @param  {number} max Maximum value
 */
SinGenerator.prototype.setBounds = function(min, max) {
  this._min = utils.default(min, this._min);
  this._max = utils.default(max, this._max);
};

/**
 * Update the angle increment (e.g. how fast we move through the sinwave)
 * @param  {number} increment New increment value
 */
SinGenerator.prototype.setIncrement = function(increment) {
  this._increment = utils.default(increment, this._increment);
};

/**
 * Generate the next value
 * @return {number} A value between generators's min and max
 */
SinGenerator.prototype.generate = function() {
  this._update();
  var n = this._p.sin(this._angle);
  n = this._p.map(n, -1, 1, this._min, this._max);
  return n;
};

/**
 * Internal update method for generating next value
 * @private
 */
SinGenerator.prototype._update = function() {
  this._angle += this._increment;
};
