const path = require('path');
const babelConfig = require('../.babelrc.js');

module.exports = {
    entry: './index.js',
    output: {
        path: './dist',
        publicPath: '/assets/',
        filename: 'bundle.js',
        library: 'VisionUI',
        libraryTarget: 'umd',
    },
    // externals: ['vue']
    resolve: {
        alias: { 'vue$': 'vue/dist/vue.common.js' },
    },
    resolveLoader: {
        modules: [path.join(__dirname, '../node_modules'), "web_loaders", "web_modules", "node_loaders", "node_modules"],

    },
    module: {
        rules: [
            { test: /\.js$/, loader: 'babel-loader',
                // exclude: /node_modules/,
                // include: /node_modules\/vision-/,
                options: babelConfig,
            },
            { test: /\.vue\/index\.js$/, loader: require.resolve('../lib/vision-loader'), options: {
                docsPath: visionConfig.docsPath,
            }},
            // { test: /\.vue\/index.md/, use: [
            //     { loader: 'file-loader' },
            //     { loader: 'markdown-it-loader' },
            // ]},
            // { test: /\.vue$/, loader: 'vue-loader' },
            { test: /\.(png|jpg|gif|svg)$/, loader: 'file-loader', options: {
                name: '[name].[ext]?[hash]',
            }},
        ],
    },
    devtool: '#eval-source-map',
    devServer: {
        historyApiFallback: true,
        // noInfo: true,
    },
    performance: { hints: 'warning' },
}
