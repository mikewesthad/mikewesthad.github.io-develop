module.exports = {
    init: init
};

var minImageWidth = 350;
var aspectRatio = 9/16;
var spacing = 15;
var transitionDuration = 800;
var $projects, $categories, $grid, $activeNavItem;
var cols, rows, w, h;

function init() {
    $grid = $("#portfolio-grid");

    $projects = [];
    $categories = {}; 
    $grid.find(".project").each(function (index, element) {
        var $element = $(element);
        $projects.push($element);
        var categoryNames = $element.data("categories").split(",");
        for (var i = 0; i < categoryNames.length; i += 1) {
            var category = $.trim(categoryNames[i]).toUpperCase();
            if (!$categories[category]) $categories[category] = [$element];
            else $categories[category].push($element);
        }
    });

    createGrid();

    $activeNavItem = $("#portfolio-nav a.active");
    $("#portfolio-nav a").on("click", onNavClick);
}

function createGrid() {
    $grid.css("position", "relative");
    var gridWidth = $grid.innerWidth();
    cols = Math.floor((gridWidth + spacing) / (minImageWidth + spacing));
    rows = Math.ceil($projects.length / cols);
    w = (gridWidth - ((cols - 1) * spacing)) / cols;
    h = w * aspectRatio;

    $projects.forEach(function ($element, index) {
        var pos = indexToXY(index, cols)
        $element.css({
            position: "absolute",
            top: pos.y + "px",
            left: pos.x + "px",
            width: w + "px",
            height: h + "px"
        });
    });
    
    $grid.css({
        height: h * rows + spacing * (rows - 1) + "px"
    });    
}

function onNavClick(e) {
    e.preventDefault();
    var $target = $(e.target);
    if ($target.is($activeNavItem)) return;
    if ($activeNavItem.length) $activeNavItem.removeClass("active");
    $target.addClass("active");
    $activeNavItem = $target;
    filterProjects($target.data("category"));
}

function filterProjects(category) {
    // Figure out the selected elements
    var $selectedElements;
    if (category === "ALL") $selectedElements = $projects;
    else $selectedElements = $categories[category] || [];

    // Animate the grid to the correct height to contain the rows
    $grid.stop();
    var curRows = Math.ceil($selectedElements.length / cols);
    $grid.animate({
        height: h * curRows + spacing * (curRows - 1) + "px"
    }, transitionDuration);
    
    // Loop through all projects
    $projects.forEach(function ($element) {
        // Stop all animations
        $element.stop();
        // If an element is not selected: drop z-index & animate opacity -> hide
        var selectedIndex = $selectedElements.indexOf($element); 
        if (selectedIndex === -1) {
            $element.css("zIndex", -1);
            $element.animate({
                opacity: 0
            }, transitionDuration, "easeInOutCubic", function () {
                $element.hide();
            });
        }
        // If an element is selected: show & bump z-index & animate to position 
        else {
            $element.show();
            $element.css("zIndex", 0);
            var newPos = indexToXY(selectedIndex, cols);
            $element.animate({ 
                opacity: 1,
                top: newPos.y + "px",
                left: newPos.x + "px"
            }, transitionDuration, "easeInOutCubic");
        }
    });
}

function set3dTranslate($element, x, y, z) {
    $element.css({
        '-webkit-transform' : 'translate3d(' + x + "," + y + "," + z + ')',
        '-moz-transform'    : 'translate3d(' + x + "," + y + "," + z + ')',
        '-ms-transform'     : 'translate3d(' + x + "," + y + "," + z + ')',
        '-o-transform'      : 'translate3d(' + x + "," + y + "," + z + ')',
        'transform'         : 'translate3d(' + x + "," + y + "," + z + ')'
    });
}

function indexToXY(index, cols) {
    var r = Math.floor(index / cols);
    var c = index % cols; 
    return {
        x: c * w + c * spacing,
        y: r * h + r * spacing
    };
}