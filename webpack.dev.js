const webpack = require('webpack');
const { merge } = require('webpack-merge');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

const common = require('./webpack.common');

const hotReload = !!process.env.HOT_RELOAD;

module.exports = merge(common, {
  devServer: {
    historyApiFallback: true,
    disableHostCheck: true,
    host: '0.0.0.0',
    port: 8080,
    hot: hotReload,
    inline: hotReload,
    proxy: {
      '/api': 'http://localhost:7080',
    },
  },
  devtool: 'cheap-module-eval-source-map',
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules\/(?!@simplewebauthn\/browser)/,
        use: [
          {
            loader: require.resolve('babel-loader'),
            options: {
              plugins: [
                hotReload && require.resolve('react-refresh/babel'),
              ].filter(Boolean),
            },
          },
        ],
      },
    ],
  },
  plugins: [
    hotReload && new webpack.HotModuleReplacementPlugin(),
    hotReload && new ReactRefreshWebpackPlugin(),
  ].filter(Boolean),
});
