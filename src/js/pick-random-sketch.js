var cookies = require("js-cookie");
var utils = require("./utilities.js");

var sketchConstructors = {
  "halftone-flashlight": require("./interactive-logos/halftone-flashlight-word.js"),
  "noisy-word": require("./interactive-logos/noisy-word-sketch.js"),
  "connect-points": require("./interactive-logos/connect-points-sketch.js")
};
var numSketches = Object.keys(sketchConstructors).length;
var cookieKey = "seen-sketch-names";

/**
 * Pick a random sketch that user hasn't seen yet. If the user has seen all the
 * sketches, just pick a random one. This uses cookies to track what the user
 * has seen already.
 * @return {Function} Constructor for a Sketch class
 */
module.exports = function pickRandomSketch() {
  var seenSketchNames = cookies.getJSON(cookieKey) || [];

  // Find the names of the unseen sketches
  var unseenSketchNames = findUnseenSketches(seenSketchNames);

  // All sketches have been seen
  if (unseenSketchNames.length === 0) {
    // If we've got more then one sketch, then make sure to choose a random
    // sketch excluding the most recently seen sketch
    if (numSketches > 1) {
      seenSketchNames = [seenSketchNames.pop()];
      unseenSketchNames = findUnseenSketches(seenSketchNames);
    } else {
      // If we've only got one sketch, then we can't do much...
      seenSketchNames = [];
      unseenSketchNames = Object.keys(sketchConstructors);
    }
  }

  var randSketchName = utils.randArrayElement(unseenSketchNames);
  seenSketchNames.push(randSketchName);

  // Store the generated sketch in a cookie. This creates a moving 7 day
  // window - anytime the site is visited, the cookie is refreshed.
  cookies.set(cookieKey, seenSketchNames, { expires: 7 });

  return sketchConstructors[randSketchName];
};

function findUnseenSketches(seenSketchNames) {
  var unseenSketchNames = [];
  for (var sketchName in sketchConstructors) {
    if (seenSketchNames.indexOf(sketchName) === -1) {
      unseenSketchNames.push(sketchName);
    }
  }
  return unseenSketchNames;
}
