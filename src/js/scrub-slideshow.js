module.exports = function init() {
    $(".scrub-slideshow").each(function (index, element) {
        setupSlideshow($(element));
    });
};

function setupSlideshow($container) {
    // Setup the images
    var images = $container.find("img");
    var $images = []; // Cache a jQuery object of each image
    images.each(function (index, element) {
        $image = $(element);
        $image.css({
            position: "absolute",
            // top: "0",
            // left: "0",
            zIndex: (index === 0) ? 2 : 0 // First image should be on top
        });
        $images.push($image);
    });

    var numImages = images.length;
    var imageIndex = 0;
    var distanceMoved = 0;
    var distanceThreshold = $images[0].width() / 2;

    var pMouseX, pMouseY;
    $container.on("mousemove", function (e) {        
        var dist = 0;
        if (pMouseX !== undefined) {
            dist = distance(pMouseX, pMouseY, e.pageX, e.pageY);
        }
        pMouseX = e.pageX;
        pMouseY = e.pageY;
        distanceMoved += dist;

        if (distanceMoved > distanceThreshold) {
            distanceMoved = 0;
            imageIndex += 1;

            // Move the image from 2 steps ago down to the bottom z-index and make
            // it invisible
            if (numImages >= 3) {
                var i = wrapIndex(imageIndex - 2, numImages);
                $images[i].css({
                    zIndex: 0,
                    opacity: 0
                });
                $images[i].stop();
            }

            // Move the image from 1 steps ago down to the middle z-index and make
            // it completely visible
            if (numImages >= 2) {
                var i = wrapIndex(imageIndex - 1, numImages);
                $images[i].css({
                    zIndex: 1,
                    opacity: 1
                });
                $images[i].stop();
            }

            // Move the current image to the top z-index and fade it in
            imageIndex = wrapIndex(imageIndex, numImages);
            $images[imageIndex].css({
                zIndex: 2,
                opacity: 0
            });
            $images[imageIndex].animate({
                opacity: 1
            }, 600);
        }
    });
}

function distance(x1, y1, x2, y2) {
    var dx = x2 - x1;
    var dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

function wrapIndex(index, length) {
    var wrappedIndex = (index % length); 
    if (wrappedIndex < 0) {
        // If negative, flip the index so that -1 becomes the last item in list 
        wrappedIndex = length + wrappedIndex;
    }
    return wrappedIndex;
}
