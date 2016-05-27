module.exports = {
    init: init
};

function init(slideshowDelay, transitionDuration) {
    $(".hover-slideshow").each(function (index, element) {
        setupSlideshow($(element), slideshowDelay, transitionDuration);
    });
};

function setupSlideshow($container, slideshowDelay, transitionDuration) {
    var images = $container.find("img");
    var numImages = images.length;
    if (numImages <= 1) return;

    // Setup the images
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

    // $container.css({
    //     width: $images[0].width(),
    //     height: $images[0].height()
    // })

    var imageIndex = 0;
    var timeoutId = null;

    $container.on("mouseenter", onEnter);
    $container.on("mouseleave", onExit);

    function onEnter(e) {  
        // First transition should happen pretty soon after hovering in order
        // to clue the user into what is happening
        timeoutId = setTimeout(advanceSlideshow, 500);
    }

    function onExit(e) {
        clearInterval(timeoutId);  
        timeoutId = null;      
    }

    function advanceSlideshow() {
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
        }, transitionDuration);

        // Schedule next transition
        timeoutId = setTimeout(advanceSlideshow, slideshowDelay);
    }
}

function wrapIndex(index, length) {
    var wrappedIndex = (index % length); 
    if (wrappedIndex < 0) {
        // If negative, flip the index so that -1 becomes the last item in list 
        wrappedIndex = length + wrappedIndex;
    }
    return wrappedIndex;
}
