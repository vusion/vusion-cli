const path = require('path');
const shell = require('shelljs');
const ora = require('ora');
const merge = require('./merge');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const MinifyPlugin = require('babel-minify-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const config = global.vusionConfig;

const prepare = (webpackConfig) => {
    const plugins = [
        new webpack.EnvironmentPlugin({
            NODE_ENV: 'production',
        }),
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
    // @TODO: Not clean by default
    if (config.clean) {
        if (webpackConfig.output.path !== process.cwd())
            shell.rm('-rf', webpackConfig.output.path);
    }

    if (config.staticPath || config.assetsPath) {
        webpackConfig.plugins.push(
            new CopyWebpackPlugin([{
                from: path.resolve(process.cwd(), config.staticPath || config.assetsPath),
                to: webpackConfig.output.path,
                ignore: ['.*'],
            }])
        );
    }

    if (config.extractCSS) {
        plugins.push(
            new ExtractTextPlugin({
                filename: webpackConfig.output.filename.replace(/\[chunkhash/g, '[contenthash').replace(/\.js$/, '.css'),
            }),
        );
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
