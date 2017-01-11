'use strict';

const webpack = require('webpack');
const webpackConfig = require('./webpack.base.conf');

webpackConfig.devtool = '#source-map';
webpackConfig.plugins = (webpackConfig.plugins || []).concat([
    // new webpack.DefinePlugin({
    //     'process.env': {
    //         NODE_ENV: '"production"',
    //     },
    // }),
    new webpack.optimize.UglifyJsPlugin({
        sourceMap: true,
        compress: { warnings: false },
    }),
    new webpack.LoaderOptionsPlugin({
        minimize: true,
    }),
]);

module.exports = webpackConfig;
