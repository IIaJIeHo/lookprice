var webpack = require('webpack');
var path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  devtool: 'source-map',

  entry: __dirname + "/client/index.js",

  output: {
    path: __dirname + '/static/dist/',
    filename: 'bundle.js',
  },
  
  resolve: {
    extensions: ['', '.js', '.jsx'],
  },
  
  module: {
    loaders: [
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract('style','css?modules'),
      },
      {
        test: /\.jsx*$/,
        exclude: 'node_modules',
        loader: 'babel',
      }
    ],
  },

};
