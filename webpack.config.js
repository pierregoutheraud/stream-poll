module.exports.getConfig = function(type) {

  var webpack = require('webpack');
  var path = require('path');

  var isDev = type === 'dev';

  var config = {
    entry: {
      app: [
        "./app/scripts/App.jsx"
      ]
    },
    output: {
      filename: 'main.js',
      path: path.join(__dirname + '/build'),
      publicPath: '/build/js',
    },
    resolve: {
      // root: __dirname + '/app/scripts',
      modulesDirectories: [
        path.join(__dirname + '/app/scripts'),
        path.join(__dirname + '/app/bower_components'),
        'node_modules'
      ],
      alias: {
        jquery: 'jquery/dist/jquery.min.js'
      },
      // fallback: path.join(__dirname, 'node_modules')
    },
    plugins: [
      new webpack.ProvidePlugin({
          $: "jquery",
          jQuery: "jquery",
          "window.jQuery": "jquery"
      })
      // new webpack.ResolverPlugin(
      //   new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin("bower.json", [])
      // )
    ],
    debug : isDev,
    module: {
      loaders: [
        {
          test: /\.jsx?$/,
          // exclude: [
          //   __dirname + '/node_modules',
          // ],
          // exclude: /node_modules/,
          include: [
            path.join(__dirname, '/app/scripts'),
            path.join(__dirname, '/node_modules/react-infinite/src'),
            path.join(__dirname, '/node_modules/react-dailymotion-follow/src')
          ],
          loaders: ['babel-loader']
        }
      ]
    }
  };

  if (isDev) {

    config.devtool = 'eval';

    // Entries
    config.entry.app.push('webpack-dev-server/client?http://localhost:9999');
    config.entry.app.push('webpack/hot/only-dev-server');

    config.plugins.push(
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoErrorsPlugin()
    );

    config.module.loaders[0].loaders = ['react-hot','babel-loader'];

  }

  // console.log( config );

  return config;
}
