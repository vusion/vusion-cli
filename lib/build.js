const path = require('path');
const shell = require('shelljs');
const ora = require('ora');
const merge = require('./merge');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const MinifyPlugin = require('babel-minify-webpack-plugin');

const config = global.vusionConfig;

const prepare = (webpackConfig) => {
    const plugins = [
        'EXTENDS',
        new webpack.EnvironmentPlugin({
            NODE_ENV: 'production',
        }),
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.optimize.ModuleConcatenationPlugin(),
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

    if (config.minifyJS === true || config.minifyJS === 'babel-minify')
        plugins.push(new MinifyPlugin());
    else if (config.minifyJS === 'uglify-js' || config.uglifyJS) {
        plugins.push(new UglifyJSPlugin({
            cache: true,
            parallel: true,
            sourceMap: config.sourceMap,
        }));
    }

    webpackConfig = merge(webpackConfig, {
        devtool: config.sourceMap ? '#source-map' : false,
        plugins,
        performance: { hints: 'warning' },
    }, config.webpack);

    if (!webpackConfig.entry || Object.keys(webpackConfig.entry).length === 0) {
        // 如果没写的话，会默认指定一个
        webpackConfig.entry = {
            bundle: './index.js',
        };
    }

    // Remove output directory and copy static files
    if (config.clean) {
        if (webpackConfig.output.path !== process.cwd())
            shell.rm('-rf', webpackConfig.output.path);
        if (config.staticPath || config.assetsPath)
            shell.cp('-r', path.resolve(process.cwd(), config.staticPath || config.assetsPath), webpackConfig.output.path);
    }

    return webpackConfig;
};

module.exports = (webpackConfig) => ({
    run() {
        webpackConfig = prepare(webpackConfig);

        return new Promise((resolve, reject) => {
            const spinner = ora('building for production...');
            spinner.start();
            webpack(webpackConfig, (err, stats) => {
                spinner.stop();
                if (err)
                    return reject(err);

                process.stdout.write(stats.toString({
                    colors: true,
                    modules: false,
                    children: false,
                    chunks: false,
                    chunkModules: false,
                }) + '\n');

                resolve();
            });
        });
    },
});
module.exports.prepare = prepare;
