// Include gulp
var gulp = require('gulp');

// Include Our Plugins
var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var browserSync = require('browser-sync').create();
var useref = require('gulp-useref');
var gulpIf = require('gulp-if');
var cssnano = require('gulp-cssnano');
var cdnizer = require("gulp-cdnizer");
// var webpack = require('gulp-webpack');

// browserSync Task
gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: 'src'
    },
  })
})

// Move vendor scripts to src dir
gulp.task('vendor', function() {
  var assets = [
    'node_modules/d3/d3.js',
    'node_modules/d3.geo.tile/index.js',
    'node_modules/topojson/build/topojson.js',
    'node_modules/d3.chart/d3.chart.js',
    'node_modules/lodash/lodash.js',
    'node_modules/d3-queue/build/queue.js',
    'node_modules/d3-svg-legend/d3-legend.js'
  ];
  return gulp.src(assets)
      .pipe(gulp.dest('src/vendor'))
});

// Lint Task
gulp.task('lint', function() {
    // return gulp.src('src/js/**/*.js')
    //     .pipe(jshint())
    //     .pipe(jshint.reporter('default'));
});

// Compile Sass
gulp.task('sass', function() {
    return gulp.src('src/scss/**/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('src/css'))
        .pipe(browserSync.reload({
          stream: true
        }))
});



// Concat js libraries, css files
gulp.task('useref', function(){
  return gulp.src('src/*.html')
      .pipe(useref())
      // .pipe(gulpIf('*.js', uglify()))
      // .pipe(gulpIf('*.css', cssnano()))
      .pipe(gulp.dest('dist'))
});

// replace local vendor assets with cdn assets
gulp.task('cdnize', ['useref'], function(){
  return gulp.src("./dist/index.html")
        .pipe(cdnizer([
            {
                file: 'vendor/d3.js',
                cdn: 'https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.14/d3.js'
            },
            {
                file: 'vendor/d3-svg-legend.js',
                cdn: 'https://cdnjs.cloudflare.com/ajax/libs/d3-legend/1.8.0/d3-legend.min.js'
            },
            {
                file: 'vendor/lodash.js',
                cdn: 'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.3.0/lodash.min.js'
            },
            {
                file: 'vendor/queue.js',
                cdn: 'https://cdnjs.cloudflare.com/ajax/libs/queue-async/1.0.7/queue.min.js'
            },
            {
                file: 'vendor/topojson.js',
                cdn: 'https://cdnjs.cloudflare.com/ajax/libs/topojson/1.6.20/topojson.min.js'
            }
        ]))
        .pipe(gulp.dest("./dist"));
})

// Build dist Task
gulp.task('dist', ['cdnize'], function() {
    return gulp.src('src/data/**/*.json')
        .pipe(gulp.dest('dist/data/'))
});

// gulp.task('webpack', function() {
//   return gulp.src('src/js/draw.js')
//     .pipe(webpack())
//     .pipe(gulp.dest('src/js'));
// });


// Watch Files For Changes
gulp.task('watch', ['browserSync', 'sass'], function() {
    gulp.watch('src/js/**/*.js', ['lint', browserSync.reload]);
    gulp.watch('src/scss/**/*.scss', ['sass']);
    gulp.watch('src/*.html', browserSync.reload);
});

// Default Task
gulp.task('default', ['sass', 'watch']);

