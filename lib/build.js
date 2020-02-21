const path = require('path');
const shell = require('shelljs');
const ora = require('ora');
const merge = require('./merge');
const webpack = require('webpack');
const ExtractTextWebpackPlugin = require('extract-text-webpack-plugin');
const UglifyjsWebpackPlugin = require('uglifyjs-webpack-plugin');
const BabelMinifyWebpackPlugin = require('babel-minify-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ForceShakingPlugin = require('./plugins/vusion-tree-shaking');

const config = global.vusionConfig;

const prepare = (webpackConfig) => {
    const plugins = [
        new webpack.EnvironmentPlugin(Object.assign({
            NODE_ENV: 'production',
        }, config.options.EnvironmentPlugin)),
        new webpack.HashedModuleIdsPlugin(),
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.optimize.ModuleConcatenationPlugin(),
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
        plugins.push(new BabelMinifyWebpackPlugin(Object.assign({}, config.options.BabelMinifyWebpackPlugin)));
    else if (config.minifyJS === 'uglify-js' || config.uglifyJS) {
        plugins.push(new UglifyjsWebpackPlugin(Object.assign({
            cache: true,
            parallel: true,
            sourceMap: config.sourceMap,
        }, config.options.UglifyjsWebpackPlugin)));
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
    }

    const staticPath = config.staticPath || config.assetsPath;
    if (staticPath) {
        if (config.assetsPath)
            console.warn('[vusion-cli]', `'assetsPath' is deprecated. Please use 'staticPath' instead.`);

        const staticPaths = Array.isArray(staticPath) ? staticPath : [staticPath];
        webpackConfig.plugins.push(
            new CopyWebpackPlugin(staticPaths.map((spath) => Object.assign({
                from: path.resolve(process.cwd(), spath),
                to: webpackConfig.output.path,
                ignore: ['.*'],
            }, config.options.CopyWebpackPlugin)))
        );
    }

    if (config.extractCSS) {
        webpackConfig.plugins.push(
            new ExtractTextWebpackPlugin(Object.assign({
                filename: webpackConfig.output.filename.replace(/\[chunkhash/g, '[contenthash').replace(/\.js$/, '.css'),
            }, config.options.ExtractTextWebpackPlugin)),
        );
    }

    if (config.forceShaking) {
        webpackConfig.plugins.push(
            new ForceShakingPlugin(Object.assign({
                shakingPath: config.forceShaking,
            }, config.options.ForceShakingPlugin))
        );
    }

    return webpackConfig;
};

module.exports = (webpackConfig) => ({
    run() {
        webpackConfig = prepare(webpackConfig);

        return new Promise((resolve, reject) => {
            const spinner = ora('Building for production...');
            spinner.start();
            webpack(webpackConfig, (err, stats) => {
                spinner.stop();
                if (err)
                    return reject(err);

                process.stdout.write(stats.toString(config.verbose ? { all: true, colors: true } : webpackConfig.stats) + '\n');

                if (stats.hasErrors())
                    reject(stats);
                else
                    resolve(stats);
            });
        });
    },
});
module.exports.prepare = prepare;
