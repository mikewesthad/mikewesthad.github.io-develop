module.exports = function init() {
    $(".hover-overlay").each(function (index, element) {
        setupOverlay($(element));
    });
};

function setupOverlay($container) {
    var image = $container.find("img");
    var title = image.data("title");
    var color = image.data("color");

    var $overlay = $("<div>")
        .addClass("project-overlay")
        .css("backgroundColor", color)
        .appendTo($container);

    var $title = $("<div>")
        .text(title)
        .addClass("project-title")
        .appendTo($container);

    $container.on("mouseenter", function (e) {
        $title.stop();
        $title.animate({
            top: ($container.height() - $title.height()) / 2
        }, 400, "easeInOutCubic");
        $overlay.stop();
        $overlay.css("opacity", 0.7);
        $overlay.animate({
            top: 0
        }, 400, "easeInOutCubic");
    });

    $container.on("mouseleave", function (e) {
        $title.stop();
        $title.animate({
            top: "100%"
        }, 400, "easeInOutCubic");
        $overlay.stop();
        $overlay.animate({
            top: "97%"
        }, 400, "easeInOutCubic", function () {
            $overlay.css("opacity", 1);
        });
    });
}