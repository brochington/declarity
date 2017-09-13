var path = require('path');
var webpack = require("webpack");

module.exports = {
  entry: [
    "./src/index.js",
  ],
  output: {
    path: __dirname + '/build/',
    filename: 'bundle.js',
    publicPath: '/build/',
    library: "declarity",
    libraryTarget: "umd",
  },
  externals: {
    "immutable": "immutable",
  },
  module: {
    rules: [{
      test: /\.js$/,
      use: ['babel-loader'],
      include: path.join(__dirname, 'src'),
    }],
  },
  devtool: 'source-map',
}
