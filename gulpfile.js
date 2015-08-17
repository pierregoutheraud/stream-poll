var gulp = require('gulp'),
    path = require('path'),
    $ = require('gulp-load-plugins')(),
    es = require('event-stream'),
    WebpackDevServer = require("webpack-dev-server"),
    webpack = require("webpack"),
    del = require("del"),
    webpackStream = require('webpack-stream');

// set variable via $ gulp --type prod --style games
var environment = $.util.env.type || 'dev';
var style = $.util.env.style || 'games';
var port = $.util.env.port || 9999;
var portLivereload = 35730;

console.log('Environment: ' + environment);
console.log('Style: ' + style);
console.log('Port: ' + port);

var isProduction = environment === 'prod';
var webpackConfig = require('./webpack.config.js').getConfig(environment);

var app = 'app/';
var public = 'public/';
var build = 'build/';
var server = 'server/';

// https://github.com/ai/autoprefixer
var autoprefixerBrowsers = [
  'ie >= 9',
  'ie_mob >= 10',
  'ff >= 30',
  'chrome >= 34',
  'safari >= 6',
  'opera >= 23',
  'ios >= 6',
  'android >= 4.4',
  'bb >= 10'
];

// copy images
gulp.task('images', function(cb) {
  return gulp.src(app + 'images/**/*.{png,svg,jpg,jpeg,gif,webm}')
    .pipe($.size({ title : 'images' }))
    .pipe(gulp.dest(build + 'images/'))
});

// gulp.task("webpack", function(callback) {
//     // run webpack
//     webpack(webpackConfig, function(err, stats) {
//         if(err) throw new gutil.PluginError("webpack", err);
//         // gutil.log("[webpack]", stats.toString({
//             // output options
//         // }));
//         callback();
//     });
// });

gulp.task("webpack-dev-server", function(callback) {
    // Start a webpack-dev-server
    var compiler = webpack(webpackConfig);

    console.log('publicPath:',  webpackConfig.output.publicPath)

    new WebpackDevServer(compiler, {
      publicPath: webpackConfig.output.publicPath,
      historyApiFallback: true,
      hot: true
    }).listen(port, "localhost", function(err) {
        if(err) throw new gutil.PluginError("webpack-dev-server", err);
        // Server listening
        $.util.log("[webpack-dev-server]", "http://localhost:"+port+"/webpack-dev-server/index.html");

        // keep the server alive or continue?
        // callback();
    });
});

gulp.task('scripts', function(cb) {
  return gulp.src("./app/scripts/App.jsx")
    .pipe(webpackStream(webpackConfig))
    .pipe($.uglify())
    .pipe($.size({ title : 'js' }))
    .pipe(gulp.dest(build + 'js/'));
});

gulp.task('serve', function() {
  $.connect.server({
    root: build,
    port: port
  });
});

gulp.task('sass', function(cb){
  return gulp.src([
      app + 'styles/main.scss',
    ])
    .pipe($.sourcemaps.init())
    .pipe($.sass().on('error', function(err) {
        $.sass.logError(err);
        this.emit('end'); //continue the process in dev
      })
    )
    .pipe($.autoprefixer({browsers: autoprefixerBrowsers}))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest(build + 'css/'))
    .pipe($.size({ title : 'sass' }))
    .pipe($.livereload());
});

gulp.task('css', ['sass'], function (cb) {

  return gulp.src(build + 'index.html')
    .pipe($.usemin({
      css: [$.minifyCss(), 'concat'],
      // html: [$.minifyHtml({empty: true})]
    }))
    .pipe($.size({ title : 'css' }))
    .pipe(gulp.dest(build));

});

// copy html from app to build
gulp.task('html', function(cb) {
  return gulp.src(app + 'index.html')
    .pipe($.size({ title : 'html' }))
    .pipe(gulp.dest(build));
});

// gulp.task('copy', function(cb) {
//   return gulp.src(app + 'bower_components/zeroclipboard/build/ZeroClipboard.swf')
//               .pipe(gulp.dest(build + 'js/'))
// });

// SERVER
gulp.task("server", function (cb) {
  return gulp.src(server + '**/*.js')
    .pipe($.babel())
    .pipe(gulp.dest(build + 'server/'));
});
gulp.task('watch-server', ['server'], function() {
  gulp.watch('server/server.js', ['server']);
  $.nodemon({ script: 'build/server/server.js' }).on('restart', function () {
    console.log('server.js restarted!')
  })
});

// watch styles, html and js file changes
gulp.task('watch', function() {
  $.livereload.listen({
    port: portLivereload
  });
  console.log('livereload listenning on port ' + portLivereload);
  gulp.watch(app + 'styles/**/*.scss', ['sass']);
});

// clean
gulp.task('clean', function(cb) {
  del([build + '*'], cb);
});

gulp.task('dev', ['css', 'webpack-dev-server', 'watch'])

// waits until clean is finished then builds the project
gulp.task('build', ['clean'], function(){
  gulp.start(['images', 'scripts', 'css', 'html']);
});
