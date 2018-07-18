/**
 * Gulp Setup
 *
 * The recipe provides:
 *
 * - A local server
 * - SASS -> CSS
 * - CommonJS modules via browserify
 * - A LiveReload server to trigger browser refresh upon saving
 *
 * Run "gulp" to start the default task, which builds the site and serves it.
 * Run with the command line flag "gulp -p" or "gulp --production" to enable
 * uglification of JS code. It is helpful while developing to NOT uglify code.
 */

// -- PATHS --------------------------------------------------------------------

const path = require("path");
var src = path.resolve(__dirname, "src");
var dest = "build";
var paths = {
  html: {
    src: [src + "/**/*.html"],
    dest: dest
  },
  jade: {
    src: [src + "/**/*.jade"],
    exclude: ["!" + src + "/**/_*.jade"],
    dataFile: path.resolve(src, "./data/jade-data.js"),
    dest: dest
  },
  sass: {
    src: [src + "/sass/**/*.{scss,sass}"],
    include: ["node_modules/bootstrap-sass/assets/stylesheets", "node_modules/font-awesome/scss"],
    dest: dest
  },
  jsLibs: {
    src: [
      src + "/js/libs/**/*.js",
      "node_modules/bootstrap-sass/assets/javascripts/bootstrap.js",
      "node_modules/velocity-animate/velocity.js"
    ],
    outputFile: "libs.js",
    dest: dest + "/js"
  },
  js: {
    entry: src + "/js/main.js",
    src: [src + "/js/**/*.js", "!" + src + "/js/libs/**/*.js"],
    outputFile: "main.js",
    dest: dest + "/js"
  },
  images: {
    src: [src + "/images/**/*.*"],
    dest: dest + "/images"
  },
  fonts: {
    src: [src + "/fonts/**/*.*", "node_modules/font-awesome/fonts/*.*"],
    dest: dest + "/fonts"
  },
  misc: {
    src: [src + "/README.md", src + "/CNAME", src + "/favicon.ico"],
    dest: dest
  },
  docs: {
    src: [src + "/docs/**/*.*"],
    dest: dest + "/docs"
  }
};

// -- SETUP --------------------------------------------------------------------

// Gulp & gulp plugins
var gulp = require("gulp");
var sass = require("gulp-sass");
var autoprefixer = require("gulp-autoprefixer");
var sourcemaps = require("gulp-sourcemaps");
var liveReload = require("gulp-livereload");
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var newer = require("gulp-newer");
var open = require("gulp-open");
var gutil = require("gulp-util");
var browserify = require("browserify");
var source = require("vinyl-source-stream");
var buffer = require("vinyl-buffer");
var del = require("del");
var express = require("express");
var fs = require("fs");
var runSequence = require("run-sequence");
var gulpif = require("gulp-if");
var pug = require("gulp-pug");
var data = require("gulp-data");
var responsive = require("gulp-responsive");
var eslint = require("gulp-eslint");
var plumber = require("gulp-plumber");
var beep = require("beepbeep");
var ngrok = require("ngrok");

// Check the command line to see if this is a production build
var isProduction = gutil.env.p || gutil.env.production;
console.log("Build environment: " + (isProduction ? "production" : "debug"));

function beepLogError(err) {
  beep();
  var stringError = err.messageFormatted || err.message || err.toString();
  var msg = [
    gutil.colors.bgRed.bold("Gulp error in plugin: " + err.plugin),
    gutil.colors.green(stringError),
    ""
  ].join("\n");
  gutil.log(msg);
  this.emit("end");
}

// -- BUILD TASKS --------------------------------------------------------------
// These gulp tasks take everything that is in src/, process them (e.g. turn
// SASS into css) and output them into public/.

// Copy HTML (src/ -> build/).  Pipe changes to LiveReload to trigger a reload.
gulp.task("copy-html", function() {
  return gulp
    .src(paths.html.src)
    .pipe(gulp.dest(paths.html.dest))
    .pipe(liveReload());
});

gulp.task("jade", function() {
  return gulp
    .src(paths.jade.src.concat(paths.jade.exclude))
    .pipe(data(() => require(paths.jade.dataFile)))
    .pipe(pug())
    .on("error", function(err) {
      gutil.log(err);
      this.emit("end");
    })
    .pipe(gulp.dest(paths.jade.dest))
    .pipe(liveReload());
});

// Turn SASS in src/ into css in build/, autoprefixing CSS vendor prefixes and
// generating sourcemaps.  Pipe changes to LiveReload to trigger a reload.
gulp.task("sass", function() {
  return gulp
    .src(paths.sass.src)
    .pipe(sourcemaps.init())
    .pipe(
      sass({
        outputStyle: "compressed",
        includePaths: paths.sass.include
      }).on("error", sass.logError)
    )
    .pipe(
      autoprefixer({
        browsers: [
          // Matches bootstrap:
          // https://github.com/twbs/bootstrap-sass#sass-autoprefixer
          "Android 2.3",
          "Android >= 4",
          "Chrome >= 20",
          "Firefox >= 24",
          "Explorer >= 8",
          "iOS >= 6",
          "Opera >= 12",
          "Safari >= 6"
        ],
        cascade: true
      })
    )
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.sass.dest))
    .pipe(liveReload());
});

// Combine, sourcemap and uglify vendor libraries (e.g. bootstrap, jquery, etc.)
// into build/js/libs.js.  This supports adding the libs in a particular order.
// Pipe changes to LiveReload to trigger a reload.
gulp.task("js-libs", function() {
  return (
    gulp
      .src(paths.jsLibs.src)
      // .pipe(order([
      //     // Order the files here, if necessary
      //     "**/*.js"
      // ]))
      .pipe(sourcemaps.init())
      .pipe(concat(paths.jsLibs.outputFile))
      // Uglify only if we are in a production build
      .pipe(gulpif(isProduction, uglify()))
      .pipe(sourcemaps.write())
      .pipe(gulp.dest(paths.jsLibs.dest))
      .pipe(liveReload())
  );
});

// Combine, sourcemap and uglify our JS libraries into main.js. This uses
// browserify (CommonJS-style modules).
gulp.task("js-browserify", function() {
  var b = browserify({
    entries: paths.js.entry,
    debug: true // Allow debugger statements
  });
  return (
    b
      .bundle()
      .on("error", function(err) {
        gutil.log(err);
        // To prevent watch task from crashing when browserify hits an error
        // we need this:
        this.emit("end");
      })
      .pipe(source(paths.js.outputFile))
      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps: true }))
      // Uglify only if we are in a production build
      .pipe(gulpif(isProduction, uglify()))
      .on("error", gutil.log)
      .pipe(sourcemaps.write())
      .pipe(gulp.dest(paths.js.dest))
      .pipe(liveReload())
  );
});

// Lint only our custom JS.
gulp.task("js-lint", function() {
  return gulp
    .src(paths.js.src)
    .pipe(plumber({ errorHandler: beepLogError }))
    .pipe(eslint())
    .pipe(eslint.format());
});

// Take any (new) images from src/images over to build/images.
gulp.task("images", function() {
  return gulp
    .src(paths.images.src)
    .pipe(newer(paths.images.dest))
    .pipe(gulp.dest(paths.images.dest));
});

gulp.task("resize-images", function() {
  return gulp
    .src(["src/original-images/**/*.{png,PNG,jpg,JPG}"])
    .pipe(
      newer({
        dest: "src/images",
        map: function(relativePath) {
          // Check if file is newer than small.jpg version of file in dest
          return (
            relativePath
              .split(".")
              .slice(0, -1)
              .join(".") + "-small.jpg"
          );
        }
      })
    )
    .pipe(
      responsive(
        {
          "**/*": [
            // {
            //     width: 1920,
            //     height: 1080,
            //     max: true,
            //     rename: { suffix: "-xlarge", extname: ".jpg" }
            // },
            {
              width: 1200,
              rename: { suffix: "-large", extname: ".jpg" }
            },
            {
              width: 300,
              rename: { suffix: "-small", extname: ".jpg" }
            }
          ]
        },
        {
          quality: 90,
          format: "jpeg",
          progressive: true,
          withMetadata: true,
          withoutEnlargement: true,
          skipOnEnlargement: false,
          errorOnEnlargement: false
        }
      )
    )
    .on("error", gutil.log)
    .pipe(gulp.dest("src/images"));
});

gulp.task("copy-gifs", function() {
  return gulp.src(["src/original-images/**/*.{gif,GIF}"]).pipe(gulp.dest("src/images"));
});

// Take any (new) fonts from src/fonts over to build/fonts.
gulp.task("fonts", function() {
  return gulp
    .src(paths.fonts.src)
    .pipe(newer(paths.fonts.dest))
    .pipe(gulp.dest(paths.fonts.dest));
});

// Take any (new) misc files from src/ over to build/
gulp.task("misc", function() {
  return gulp
    .src(paths.misc.src)
    .pipe(newer(paths.misc.dest))
    .pipe(gulp.dest(paths.misc.dest));
});

// Take any (new) misc files from src/ over to build/
gulp.task("docs", function() {
  return gulp
    .src(paths.docs.src)
    .pipe(newer(paths.docs.dest))
    .pipe(gulp.dest(paths.docs.dest));
});

// The build task will run all the individual build-related tasks above.
gulp.task("build", [
  "copy-html",
  "jade",
  "sass",
  "images",
  "fonts",
  "misc",
  "docs",
  "js-lint",
  "js-browserify",
  "js-libs"
]);

// -- RUNNING TASKS ------------------------------------------------------------
// These gulp tasks handle everything related to running the site.  Starting a
// local server, watching for changes to files, opening a browser, etc.

// Watch for changes and then trigger the appropraite build task.  This also
// starts a LiveReload server that can tell the browser to refresh the page.
gulp.task("watch", function() {
  liveReload.listen(); // Start the LiveReload server
  gulp.watch(paths.html.src, ["copy-html"]);
  gulp.watch(paths.jade.src.concat(paths.jade.dataFile), ["jade"]);
  gulp.watch(paths.jsLibs.src, ["js-libs"]);
  gulp.watch(paths.js.src, ["js-lint", "js-browserify"]);
  gulp.watch(paths.sass.src, ["sass"]);
  gulp.watch(paths.images.src, ["images"]);
  gulp.watch(paths.fonts.src, ["fonts"]);
  gulp.watch(paths.docs.src, ["docs"]);
});

// Start an express server that serves everything in build/ to localhost:8080/.
gulp.task("express-server", function() {
  var app = express();
  app.use(express.static(dest));
  app.listen(8080);
});

gulp.task("ngrok", function() {
  ngrok.connect(
    { proto: "http", addr: 8080 },
    function(err, url) {
      if (err) console.error(err);
      else console.log("Hosting localserver at: " + url);
    }
  );
});

// Automatically open localhost:8080/ in the browser using whatever the default
// browser.
gulp.task("open", function() {
  return gulp.src(dest).pipe(open({ uri: "http://127.0.0.1:8080" }));
});

// The build task will run all the individual run-related tasks above.
gulp.task("run", ["watch", "express-server", "open"]);

// -- CLEANING TASKS ----------------------------------------------------------
// These gulp tasks handle deleting unnecessary files

gulp.task("clean:dest", function() {
  return del(dest);
});

gulp.task("clean:images", function() {
  return del(paths.images.src);
});

// -- DEFAULT TASK -------------------------------------------------------------
// This gulp task runs automatically when you don't specify task.

// Build and then run it.
gulp.task("default", function(callback) {
  runSequence("build", "run", callback);
});
