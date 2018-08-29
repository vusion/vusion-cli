const fs = require('fs');
const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const config = require('./base');
const merge = require('../lib/merge');
const webpack = require('webpack');

const webpackConfig = merge(config, {
    entry: {
        bundle: './index.js',
        docs: require.resolve('@vusion/doc-loader/views/index.js'),
    },
    output: {
        path: path.join(process.cwd(), 'public'),
        // Use relative public path by default
        publicPath: '',
        filename: '[name].js',
        chunkFilename: 'chunk.[name].[chunkhash:16].js',
        library: 'Library',
        libraryTarget: 'umd',
    },
});

const iterator = require('markdown-it-for-inline');
// webpackConfig.module.rules.push({ test: /\.vue[\\/]index\.js$/, loader: '@vusion/doc-loader' }); // Position below so processing before `vue-multifile-loader`
webpackConfig.module.rules.push({
    test: /\.md$/,
    use: [{
        loader: 'vue-loader',
        options: {
            preserveWhitespace: false,
        },
    }, {
        loader: '@vusion/md-vue-loader',
        options: {
            wrapper: 'u-article',
            plugins: [
                [iterator, 'link_converter', 'link_open', (tokens, idx) => tokens[idx].tag = 'u-link'],
                [iterator, 'link_converter', 'link_close', (tokens, idx) => tokens[idx].tag = 'u-link'],
            ],
        },
    }],
});

webpackConfig.plugins.push(new HTMLWebpackPlugin({
    filename: 'index.html',
    template: path.resolve(require.resolve('@vusion/doc-loader/views/index.js'), '../index.html'),
    chunks: ['docs'],
    hash: true,
}));
// For history mode 404 on GitHub
webpackConfig.plugins.push(new HTMLWebpackPlugin({
    filename: '404.html',
    template: path.resolve(require.resolve('@vusion/doc-loader/views/index.js'), '../index.html'),
    chunks: ['docs'],
    hash: true,
}));

const docsPath = path.resolve(process.cwd(), 'docs');
const docsComponentsPath = path.resolve(docsPath, 'components');
const docsViewsPath = path.resolve(docsPath, 'views');
webpackConfig.plugins.push(new webpack.DefinePlugin({
    DOCS_PATH: fs.existsSync(docsPath) ? JSON.stringify(docsPath) : undefined,
    DOCS_COMPONENTS_PATH: fs.existsSync(docsComponentsPath) ? JSON.stringify(docsComponentsPath) : undefined,
    DOCS_VIEWS_PATH: fs.existsSync(docsViewsPath) ? JSON.stringify(docsViewsPath) : undefined,
}));

module.exports = webpackConfig;
