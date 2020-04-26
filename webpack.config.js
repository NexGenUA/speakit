const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {

  entry: ['@babel/polyfill', './src/index.js', './src/styles/style.scss'],
  output: {
    filename: '[hash].bundle.js',
    path: path.resolve(__dirname, 'public'),
  },

  devServer: {
    contentBase: path.resolve(__dirname, 'public'),
    port: 4200,
  },

  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),
    new MiniCssExtractPlugin({
      filename: '[hash].style.css',
    }),
    new CopyPlugin([
      { from: './src/assets/fav', to: './' },
      { from: './src/data', to: './files' },
    ]),
  ],

  module: {
    rules: [
      {
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader',
            options: {
              minimize: false,
            },
          },
        ],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf|svg)$/i,
        loader: 'file-loader',
        options: { outputPath: 'assets/fonts' },
      },
      {
        test: /\.(jpg|jpeg|png|gif)$/i,
        loader: 'file-loader',
        options: {
          name: '[hash:7].[name].[ext]',
          outputPath: 'assets/img',
        },
      },
      {
        test: /\.mp3$/i,
        loader: 'file-loader',
        options: {
          name: '[hash:7].[name].[ext]',
          outputPath: 'assets/audio',
        },
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
            ],
            plugins: [
              '@babel/plugin-proposal-class-properties',
            ],
          },
        },
      },
    ],
  },
};
