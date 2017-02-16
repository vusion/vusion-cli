'use strict';

const webpack = require('webpack');
const webpackConfig = require('./webpack.base.conf');

module.exports = Object.assign(webpackConfig, {
    devtool: '#source-map',
    plugins: [
        // new webpack.DefinePlugin({
        //     'process.env': {
        //         NODE_ENV: '"production"',
        //     },
        // }),
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: true,
            compress: { warnings: false },
        }),
        new webpack.LoaderOptionsPlugin({
            minimize: true,
        }),
    ],
    performance: { hints: 'warning' },
})
