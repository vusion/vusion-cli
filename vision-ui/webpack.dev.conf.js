'use strict';

const merge = require('webpack-merge');
const webpack = require('webpack');
const webpackConfig = require('./webpack.base.conf');
const FriendlyErrors = require('friendly-errors-webpack-plugin');

module.exports = merge(webpackConfig, {
//     // eval-source-map is faster for development
//     devtool: '#eval-source-map',
    plugins: [
        // new webpack.DefinePlugin({
        //     'process.env': 'development',
        // }),
        new webpack.HotModuleReplacementPlugin(), // hot reload
        // new webpack.NamedModulesPlugin(),
        new webpack.NoEmitOnErrorsPlugin(), // skip errors
//         // https://github.com/ampedandwired/html-webpack-plugin
//         // new HtmlWebpackPlugin({
//         //     filename: 'index.html',
//         //     template: 'index.html',
//         //     inject: true
//         // }),
//         new FriendlyErrors()
    ],
    performance: { hints: false },
});
