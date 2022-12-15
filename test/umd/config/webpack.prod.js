const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const ROOT_DIRECTORY = process.cwd();

module.exports = {
  mode: 'production',
  entry: {
    main: path.resolve(ROOT_DIRECTORY, 'src/index.js'),
  },
  output: {
    path: path.resolve(ROOT_DIRECTORY, 'build'),
    filename: '[name].[contenthash:8].bundle.js',
    chunkFilename: '[name].[contenthash:8].chunk.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            configFile: path.resolve(ROOT_DIRECTORY, 'config/babel.config.js'),
          },
        },
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: path.resolve(ROOT_DIRECTORY, 'src/index.html'),
      filename: 'index.html',
      minify: {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      },
    }),
  ],
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          parse: {
            ecma: 8,
          },
          compress: {
            comparisons: false,
            ecma: 5,
            inline: 2,
          },
          mangle: {
            safari10: true,
          },
          output: {
            ascii_only: true,
            comments: false,
            ecma: 5,
          },
        },
      }),
    ],
    runtimeChunk: {
      name: (entrypoint) => `runtime-${entrypoint.name}`,
    },
    splitChunks: {
      chunks: 'all',
    },
  },
};
