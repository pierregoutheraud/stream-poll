module.exports = function(config) {

  var webpackConfig = require('./webpack.config.js').getConfig();
  webpackConfig.devtool = 'inline-source-map';

  config.set({
    browsers: ['PhantomJS'],
    files: [
      { pattern: 'tests.webpack.js', watched: false },
    ],
    frameworks: ['jasmine'],
    preprocessors: {
      'tests.webpack.js': ['webpack'],
    },
    reporters: ['dots'],
    singleRun: true,
    // webpack: webpackConfig,
    webpack: {
      devtool: 'inline-source-map', //just do inline source maps instead of the default
      resolve: webpackConfig.resolve,
      plugins: webpackConfig.plugins,
      module: webpackConfig.module
    },
    webpackServer: {
      noInfo: true,
    },
  });

};