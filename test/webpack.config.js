var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var path = require('path');

module.exports =
{
  entry: {
    main: path.resolve(__dirname, 'src/main.js'),
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    publicPath: './',
    filename: '[name]-[chunkhash].js',
  },
  module: {
    loaders: [
      { test: /\.js$/,
        loader: 'babel-loader',
        exclude: /(node_modules)|(build)/,
      },
      { test: /\.(png|jpg|gif)$/,
        loader: 'file-loader',
        query: {
          name: '[hash]_[name].[ext]',
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'main.html',
      template: path.resolve(__dirname, 'src/main.html'),
    }),
    new webpack.NoErrorsPlugin(),
  ]
};
