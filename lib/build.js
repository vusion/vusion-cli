'use strict';

const path = require('path');
const shell = require('shelljs');
const ora = require('ora');
const merge = require('./merge');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const config = global.vusionConfig;

const prepare = (webpackConfig) => {
    const plugins = [
        'EXTENDS',
        new webpack.EnvironmentPlugin({
            NODE_ENV: 'production',
        }),
        new webpack.optimize.OccurrenceOrderPlugin(),
        new ExtractTextPlugin(webpackConfig.output.filename.replace(/\.js$/, '.css')),
        new webpack.LoaderOptionsPlugin({
            minimize: true,
        }),
        new webpack.BannerPlugin({
            banner: 'Packed by Vusion.',
            entryOnly: true,
            test: /\.js$/,
        }),
    ];

    config.experimental && plugins.push(new webpack.optimize.ModuleConcatenationPlugin());

    config.uglifyJS && plugins.push(new UglifyJSPlugin({
        sourceMap: config.sourceMap,
        compress: { warnings: false },
    }));

    webpackConfig = merge(webpackConfig, {
        devtool: config.sourceMap ? '#source-map' : false,
        plugins,
        performance: { hints: 'warning' },
    }, config.webpack);

    // Remove output directory and copy assets
    if (config.clean) {
        if (webpackConfig.output.path !== process.cwd())
            shell.rm('-rf', webpackConfig.output.path);
        if (config.assetsPath)
            shell.cp('-r', path.resolve(process.cwd(), config.assetsPath), webpackConfig.output.path);
    }

    return webpackConfig;
};

module.exports.prepare = prepare;
module.exports = (webpackConfig) => ({
    run() {
        webpackConfig = prepare(webpackConfig);

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
    },
});
