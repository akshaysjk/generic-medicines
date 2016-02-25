//server
var SERVER_FOLDER = './server';
var SERVER_MAIN_FILE = SERVER_FOLDER + '/server.js';
var SERVER_FILES = SERVER_FOLDER + '/';



//client
var CLIENT_FOLDER = './client';
var CLIENT_CSS = CLIENT_FOLDER + '/assets/css/**/*.css';
var CLIENT_JS_FOLDER = CLIENT_FOLDER + '/assets/js';
var CLIENT_JS = CLIENT_JS_FOLDER + '/**/*.js';
var CLIENT_JS_VENDOR = CLIENT_FOLDER + '/assets/js/vendor/**/*.js';
var CLIENT_HTML = CLIENT_FOLDER + '/*.html';


//build
var BUILD_FOLDER = './public';
var BUILD_CSS_FOLDER = BUILD_FOLDER + '/assets/css';
var BUILD_JS_FOLDER = BUILD_FOLDER + '/assets/js';
var BUILD_JS_FILES = BUILD_JS_FOLDER + '/**/*.js';
var BUILD_HTML_FOLDER = BUILD_FOLDER;

var gulp = require('gulp'),
    minifyCss = require('gulp-cssnano'),
    cache = require('gulp-cached'),
    concat = require('gulp-concat'),
    sourcemaps = require('gulp-sourcemaps'),
    uglify = require('gulp-uglify'),
    order = require('gulp-order'),
    ignore = require('gulp-ignore'),
    print = require('gulp-print'),
    stream = require('event-stream'),
    browserSync = require('browser-sync').create(),
    reload = browserSync.reload,
    nodemon = require('gulp-nodemon'),
    browserify = require('browserify'),
    watchify = require('watchify'),
    glob = require('glob'),
    rename = require('gulp-rename'),
    source = require('vinyl-source-stream');


gulp.task('browserSync', ['nodemon'], function () {
    console.log('browserSync called');
    browserSync.init({
        proxy: 'http://localhost:8000',
        browser: 'google chrome',
        port: 9000
    })
});

gulp.task('nodemon', function (cb) {
    console.log('nodemon called');
    var started = false;

    return nodemon({
        script: SERVER_MAIN_FILE,
        watch: [SERVER_FILES]
    }).on('start', function () {
        //to avoid nodemon being started multiple times
        if (!started) {
            cb();
            started = true;
        }
    }).on('restart', reload);
});


gulp.task('css', function () {
    console.log('css called');
    var fileOrder = [
    "dataTables.bootstrap.min.css",
    "responsive.bootstrap.min.css",
    "loader.css",
    "autocomplete.css",
    "application.css"];
    return gulp.src(CLIENT_CSS)
        .pipe(order(fileOrder))
        .pipe(cache()) //only pass changed files
        .pipe(print())
        .pipe(minifyCss())
        .pipe(concat('main.css'))
        .pipe(gulp.dest(BUILD_CSS_FOLDER))
        .pipe(browserSync.reload({
            stream: true
        }))
});

gulp.task('my_js', ['browserify'], function () {
    var fileOrder = ["*.js",
                     "entities/*.js",
                     "common/*.js",
                     "apps/medicines/search/*.js",
                     "apps/medicines/show/**/*.js",
                     "apps/medicines/*js",
                     ];
    var vendorFiles = "vendor/**/*.js";
    return gulp.src(BUILD_JS_FOLDER + '/client/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(order(fileOrder))
        .pipe(cache())
        //.pipe(ignore.exclude(vendorFiles))
        .pipe(concat('main.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('maps'))
        .pipe(gulp.dest(BUILD_JS_FOLDER));
});

gulp.task('browserify', function (done) {
    glob('{' + CLIENT_JS_FOLDER + '/*.js,' +
        CLIENT_JS_FOLDER + '/apps/**/*.js,' +
        CLIENT_JS_FOLDER + '/common/**/*.js,' +
        CLIENT_JS_FOLDER + '/entities/**/*.js}',
        function (err, files) {
            if (err) done(err);

            var tasks = files.map(function (entry) {
                return browserify({
                        entries: [entry]
                    })
                    .bundle()
                    .pipe(source(entry))
                    .pipe(rename({
                        extname: '.bundle.js'
                    }))
                    .pipe(gulp.dest(BUILD_JS_FOLDER));
            });
            stream.merge(tasks).on('end', done);
        })
});

gulp.task('vendor_js', function () {
    var fileOrder = ["jquery.js",
    "underscore.js",
     "backbone.js",
     "backbone.localStorage.js",
     "backbone.wreqr.js",
     "backbone.babysitter.js",
     "backbone.marionette.js",
     "bootstrap.min.js",
     'jquery.dataTables.min.js',
     'dataTables.bootstrap.min.js',
     'Chart.min.js',
     'typeahead.js'];
    return gulp.src(CLIENT_JS_VENDOR)
        .pipe(order(fileOrder))
        .pipe(cache())
        .pipe(print())
        .pipe(concat('vendor.js'))
        .pipe(uglify())
        .pipe(gulp.dest(BUILD_JS_FOLDER))
        .pipe(browserSync.reload({
            stream: true
        }));
});

gulp.task('js', ['my_js', 'vendor_js'], function () {
    console.log('js called');
});

gulp.task('html', function () {
    console.log('html called');
    return gulp.src(CLIENT_HTML)
        .pipe(cache()) //only pass changed files
        .pipe(gulp.dest(BUILD_HTML_FOLDER))
        .pipe(browserSync.reload({
            stream: true
        }))
});


gulp.task('build', ['css', 'js', 'html']);

gulp.task('watch', function () {
    gulp.watch([CLIENT_CSS, CLIENT_JS, CLIENT_HTML], ['build']);
});

gulp.task('default', ['build', 'browserSync', 'watch']);