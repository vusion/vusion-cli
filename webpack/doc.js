const fs = require('fs');
const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const merge = require('../lib/merge');
const webpack = require('webpack');
const baseConfig = require('./base');
const config = global.vusionConfig;

const webpackConfig = merge(baseConfig, {
    entry: {
        docs: require.resolve('@vusion/doc-loader/views/index.js'),
    },
    output: {
        path: path.join(process.cwd(), 'public'),
        publicPath: config.docs && config.docs.base,
        filename: '[name].js',
        chunkFilename: 'chunk.[name].[chunkhash:16].js',
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
            showCodeLineCount: 5,
            codeProcess(live, code, content, lang) {
                const relativePath = path.relative(process.cwd(), this.loader.resourcePath).replace(/\\/g, '/').replace(/^(\.\.\/)+/, '');

                if (live) {
                    const lineCount = content.split('\n').length;
                    return `<u-code-example
    :show-code="${lineCount <= this.options.showCodeLineCount}"
    :show-detail="${lang === 'vue'}"
    file-path="${relativePath}">
    <div>${live}</div>
    <div slot="code">${code}</div>
</u-code-example>\n\n`;
                } else
                    return code;
            },
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
