'use strict';

const path = require('path');
const webpack = require('webpack');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const env = require('./env.cjs');

console.log('Environment', env.stringified);

/** @type {webpack.WebpackOptionsNormalized} */
module.exports = {
  entry: './test/page/index.js',
  devtool: 'cheap-module-source-map',
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
    filename: 'index_bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        resolve: { fullySpecified: false },
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
    ],
  },
  devServer: {
    historyApiFallback: true,
    allowedHosts: ['.swell.test', 'localhost'],
    host: process.env.DEV_SERVER_HOST,
  },
  mode: 'development',
  plugins: [
    new HtmlWebpackPlugin({
      template: 'test/page/index.html',
    }),
    new InterpolateHtmlPlugin(HtmlWebpackPlugin, env.raw),
    new webpack.DefinePlugin(env.stringified),
  ],
};
