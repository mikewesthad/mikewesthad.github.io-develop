module.exports = ImageGalleries;

var utilities = require("./utilities.js");

function ImageGalleries(transitionDuration) { 
    transitionDuration = (transitionDuration !== undefined) ?
        transitionDuration : 400;
    this._imageGalleries = [];
    $(".image-gallery").each(function (index, element) {
        var gallery = new ImageGallery($(element), transitionDuration);
        this._imageGalleries.push(gallery);
    }.bind(this));
}

function ImageGallery($container, transitionDuration) {
    this._transitionDuration = transitionDuration;
    this._$container = $container;
    this._$thumbnailContainer = $container.find(".image-gallery-thumbnails");
    this._index = 0; // Index of selected image

    // Loop through the thumbnails, give them an index data attribute and cache
    // a reference to them in an array
    this._$thumbnails = [];
    this._$thumbnailContainer.find("img").each(function (index, element) {
        var $thumbnail = $(element);
        $thumbnail.data("index", index);
        this._$thumbnails.push($thumbnail);
    }.bind(this));

    // Create empty images in the gallery for each thumbnail. This helps us do
    // lazy loading of gallery images and allows us to cross-fade images.
    this._$galleryImages = [];
    for (var i = 0; i < this._$thumbnails.length; i += 1) {
        // Calculate the id from the path to the large image
        var largePath = this._$thumbnails[i].data("large-path");
        var id = largePath.split("/").pop().split(".")[0];
        var $galleryImage = $("<img>")
            .css({
                position: "absolute",
                top: "0px",
                left: "0px",
                opacity: 0,
                zIndex: 0,
                backgroundColor: "white"
            })
            .attr("id", id)
            .data("image-url", largePath)
            .appendTo($container.find(".image-gallery-selected"));
        $galleryImage.get(0).src = largePath; // TODO: Make this lazy!
        this._$galleryImages.push($galleryImage);
    }

    // Activate the first thumbnail and display it in the gallery 
    this._switchActiveImage(0);

    // Bind the event handlers to the images
    this._$thumbnailContainer.find("img").on("click", this._onClick.bind(this));
}

ImageGallery.prototype._switchActiveImage = function (index) {
    // Reset all images to invisible and lowest z-index. This could be smarter,
    // like HoverSlideshow, and only reset exactly what we need, but we aren't 
    // wasting that many cycles.
    this._$galleryImages.forEach(function ($galleryImage) {
        $galleryImage.css({
            "zIndex": 0,
            "opacity": 0
        });
        $galleryImage.velocity("stop"); // Stop any animations
    }, this)

    // Cache references to the last and current image & thumbnails
    var $lastThumbnail = this._$thumbnails[this._index];
    var $lastImage = this._$galleryImages[this._index];
    this._index = index;
    var $currentThumbnail = this._$thumbnails[this._index];
    var $currentImage = this._$galleryImages[this._index];

    // Activate/deactivate thumbnails
    $lastThumbnail.removeClass("active");
    $currentThumbnail.addClass("active");

    // Make the last image visisble and then animate the current image into view
    // on top of the last
    $lastImage.css("zIndex", 1);
    $currentImage.css("zIndex", 2);
    $lastImage.css("opacity", 1);
    $currentImage.velocity({"opacity": 1}, this._transitionDuration, 
        "easeInOutQuad");

    // Object image fit polyfill breaks jQuery attr(...), so fallback to just 
    // using element.src
    // TODO: Lazy!
    // if ($currentImage.get(0).src === "") {
    //     $currentImage.get(0).src = $currentImage.data("image-url");
    // }
};

ImageGallery.prototype._onClick = function (e) {
    var $target = $(e.target);
    var index = $target.data("index");
    
    // Clicked on the active image - no need to do anything
    if (this._index === index) return;

    this._switchActiveImage(index);  
};