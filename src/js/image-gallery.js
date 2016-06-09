module.exports = ImageGalleries;

function ImageGalleries() { 
    this._imageGalleries = [];
    $(".image-gallery").each(function (index, element) {
        this._imageGalleries.push(new ImageGallery($(element)));
    }.bind(this));
}

function ImageGallery($container) {
    this._$container = $container;
    this._$thumbnailContainer = $container.find(".image-gallery-thumbnails");
    this._index = 0;

    this._$images = []; // Cache a jQuery object of each image
    this._$thumbnailContainer.find("img").each(function (index, element) {
        var $image = $(element);
        $image.data("index", index);
        this._$images.push($image);
    }.bind(this));

    this._$selectedThumbnail = this._$images[this._index];
    this._$selectedThumbnail.addClass("active");

    this._$activeImage = $("<img>")
        .appendTo($container.find(".image-gallery-selected"));
    this._switchActiveImage(0);

    this._$thumbnailContainer.find("img").on("click", this._onClick.bind(this));
}

ImageGallery.prototype._switchActiveImage = function (index) { 
    this._index = index;
    this._$selectedThumbnail.removeClass("active");
    this._$selectedThumbnail = this._$images[index];
    this._$selectedThumbnail.addClass("active");

    // Object image fit polyfill breaks jQuery attr(...), so fallback to just 
    // using element.src
    var src = this._$selectedThumbnail.get(0).src;
    this._$activeImage.get(0).src = src; 

    var imageName = src.split("/").pop().split(".");
    imageName.pop();
    imageName.join("");
    this._$activeImage.attr("id", imageName);
};

ImageGallery.prototype._onClick = function (e) {
    var $target = $(e.target);
    var index = $target.data("index");
    
    if (this._index === index) return;

    this._switchActiveImage(index);  
};