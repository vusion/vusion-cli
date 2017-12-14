const path = require('path');
const shell = require('shelljs');
const ora = require('ora');
const merge = require('./merge');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const MinifyPlugin = require('babel-minify-webpack-plugin');
const SpriteLoaderPlugin = require('svg-sprite-loader/plugin');

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
        new SpriteLoaderPlugin(),
    ];

    const svgRule = {
        test: /\.svg$/,
        oneOf: [
            { resourceQuery: /sprite/, loader: 'svg-sprite-loader', options: { extract: true, spriteFilename: 'sprite.[hash:16].svg', esModule: config.extractCSS } },
            { loader: 'file-loader', options: { name: '[name].[hash:16].[ext]' } },
        ],
    };

    config.experimental && plugins.push(new webpack.optimize.ModuleConcatenationPlugin());

    if (config.minifyJS === true || config.minifyJS === 'babel-minify')
        plugins.push(new MinifyPlugin());
    else if (config.minifyJS === 'uglify-js' || config.uglifyJS) {
        plugins.push(new UglifyJSPlugin({
            sourceMap: config.sourceMap,
            compress: { warnings: false },
        }));
    }

    webpackConfig = merge(webpackConfig, {
        devtool: config.sourceMap ? '#source-map' : false,
        plugins,
        performance: { hints: 'warning' },
        module: {
            EXTENDS: true,
            rules: [
                'EXTENDS',
                svgRule,
            ],
        },
    }, config.webpack);

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
