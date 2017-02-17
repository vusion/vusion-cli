'use strict';

require('shelljs/global');
const ora = require('ora');
const webpack = require('webpack');

module.exports = function (webpackConfig, port) {
    webpackConfig = Object.assign(webpackConfig, global.visionConfig.webpack, {
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
    });

    // rm('-rf', webpackConfig.output.path);
    // rm('-rf', visionConfig.docsPath);

    const spinner = ora('building for production...');
    spinner.start();
    webpack(webpackConfig, (err, stats) => {
        spinner.stop();
        if (err) throw err;

        process.stdout.write(stats.toString({
            colors: true,
            modules: false,
            children: false,
            chunks: false,
            chunkModules: false,
        }) + '\n');
    });
};
