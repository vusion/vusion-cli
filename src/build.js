'use strict';

const path = require('path');
const shell = require('shelljs');
const ora = require('ora');
const merge = require('./merge');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = function (webpackConfig) {
    webpackConfig = merge(webpackConfig, {
        devtool: '#source-map',
        plugins: [
            'EXTENDS',
            new webpack.EnvironmentPlugin({
                NODE_ENV: 'production',
            }),
            new webpack.optimize.OccurrenceOrderPlugin(),
            new ExtractTextPlugin('styles.css'),
            new UglifyJSPlugin({
                sourceMap: true,
                compress: { warnings: false },
            }),
            new webpack.LoaderOptionsPlugin({
                minimize: true,
            }),
            new webpack.BannerPlugin({
                banner: 'Packed by Vusion.',
                entryOnly: true,
                test: /\.js$/,
            }),
        ],
        performance: { hints: 'warning' },
    }, global.vusionConfig.webpack);

    // Remove output directory and copy assets
    shell.rm('-rf', webpackConfig.output.path);
    if (global.vusionConfig.assetsPath)
        shell.cp('-r', path.resolve(process.cwd(), global.vusionConfig.assetsPath), webpackConfig.output.path);

    const spinner = ora('building for production...');
    spinner.start();
    webpack(webpackConfig, (err, stats) => {
        spinner.stop();
        if (err)
            throw err;

        process.stdout.write(stats.toString({
            colors: true,
            modules: false,
            children: false,
            chunks: false,
            chunkModules: false,
        }) + '\n');
    });
};
