const path = require('path');
const merge = require('../lib/merge');

const ExtractTextWebpackPlugin = require('extract-text-webpack-plugin');
const IconFontPlugin = require('icon-font-loader').Plugin;
const CSSSpritePlugin = require('css-sprite-loader').Plugin;
const HTMLWebpackPlugin = require('html-webpack-plugin');
const postcssImportResolver = require('postcss-import-resolver');

const importGlobalLoaderPath = require.resolve('../lib/loaders/import-global-loader');

const config = global.vusionConfig;

let resolveModules;
if (config.resolvePriority === 'cwd')
    resolveModules = [path.resolve(process.cwd(), 'node_modules'), path.resolve(__dirname, '../node_modules'), path.resolve(__dirname, '../../'), 'node_modules'];
else
    resolveModules = [path.resolve(__dirname, '../node_modules'), path.resolve(__dirname, '../../'), 'node_modules'];

const postcssImportAlias = Object.assign({}, config.webpack.resolve ? config.webpack.resolve.alias : {});
delete postcssImportAlias.EXTENDS;

// Postcss plugins
const postcssPlugins = [
    require('../lib/loaders/postcss-mark.js'),
    require('postcss-import')({
        resolve: postcssImportResolver({
            alias: postcssImportAlias,
            modules: resolveModules,
        }),
    }),
    require('postcss-url')({
        // Must start with `./`
        // Rewrite https://github.com/postcss/postcss-url/blob/master/src/type/rebase.js
        url(asset, dir) {
            // base64编码的图片直接返回
            // if (asset.url.startsWith('data:image') || asset.url.startsWith('http') || asset.url.startsWith('/'))
            // return asset.url;
            if (asset.url[0] !== '.')
                return asset.url;

            let rebasedUrl = path.normalize(path.relative(dir.to, asset.absolutePath));
            rebasedUrl = path.sep === '\\' ? rebasedUrl.replace(/\\/g, '/') : rebasedUrl;
            return `./${rebasedUrl}${asset.search}${asset.hash}`;
        },
    }),
    // precss removed
    require('postcss-variables'),
    require('postcss-preset-env')({
        stage: 0,
        browsers: config.browsers,
    }),
    // precss removed
    require('postcss-calc'),
    require('../lib/loaders/postcss-merge.js'),
].concat(config.postcss);

// Vue loader options
const vueOptions = merge({
    preserveWhitespace: false,
    postcss: postcssPlugins,
    cssModules: {
        importLoaders: process.env.NODE_ENV === 'production' ? 5 : 3,
        localIdentName: process.env.NODE_ENV === 'production' ? '[hash:base64:16]' : '[name]_[local]_[hash:base64:8]',
        minimize: process.env.NODE_ENV === 'production' && !!(config.uglifyJS || config.minifyJS),
    },
    cssSourceMap: config.sourceMap,
    extractCSS: process.env.NODE_ENV === 'production' && config.extractCSS,
    preLoaders: {
        css: importGlobalLoaderPath,
    },
    midLoaders: {
        css: process.env.NODE_ENV === 'production' ? ['css-sprite-loader', 'svg-classic-sprite-loader?filter=query', 'icon-font-loader'].join('!') : 'icon-font-loader',
    },
}, config.vue);

// CSS loaders options
let cssRule = [
    { loader: '@vusion/css-loader', options: Object.assign({
        // modules: true, // CSS Modules 是关闭的
        minimize: config.uglifyJS || config.minifyJS,
        sourceMap: config.sourceMap,
    }, vueOptions.cssModules) },
    'icon-font-loader',
    { loader: 'postcss-loader', options: { plugins: (loader) => postcssPlugins } },
    importGlobalLoaderPath,
];
// Only generate sprites in production mode
if (process.env.NODE_ENV === 'production')
    cssRule.splice(1, 0, 'css-sprite-loader', 'svg-classic-sprite-loader?filter=query');

if (vueOptions.extractCSS)
    cssRule = ExtractTextWebpackPlugin.extract({ use: cssRule, fallback: 'style-loader' });
else
    cssRule.unshift('style-loader');

const plugins = [
    new IconFontPlugin(Object.assign({
        fontName: 'vusion-icon-font',
        mergeDuplicates: process.env.NODE_ENV === 'production',
    }, config.options.IconFontPlugin)),
];
// Only generate sprites in production mode
if (process.env.NODE_ENV === 'production') {
    plugins.push(new CSSSpritePlugin(Object.assign({
        plugins: postcssPlugins,
    }, config.options.CSSSpritePlugin)));
}

// Webpack config
const webpackConfig = {
    entry: {}, // Required in vusion.config.js or --entry-path
    resolve: {
        /**
         * Must use this order, otherwise there're some problem when resolving packages:
         * 1. node_modules in current directory
         * 2. node_modules in vusion-cli
         * 3. node_modules outside of vusion-cli
         * 4. node_modules recursively outside of current directory
         */
        modules: resolveModules,
        alias: { vue$: 'vue/dist/vue.esm.js' },
    },
    resolveLoader: {
        modules: resolveModules,
        alias: {
            'css-loader': '@vusion/css-loader',
            'vue-loader': '@vusion/vue-loader',
        },
    },
    devtool: '#eval-source-map',
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: (filepath) => {
                    const babelIncludes = Array.isArray(config.babelIncludes) ? config.babelIncludes : [config.babelIncludes];
                    const reincludes = [
                        /\.(?:vue|vusion)[\\/].*\.js$/,
                        /\.es6\.js$/,
                    ].concat(babelIncludes);

                    return filepath.includes('node_modules') && !reincludes.some((reinclude) => {
                        if (typeof reinclude === 'string')
                            return filepath.includes(reinclude) || filepath.includes(reinclude.replace(/\//g, '\\'));
                        else if (reinclude instanceof RegExp)
                            return reinclude.test(filepath);
                        else if (typeof reinclude === 'function')
                            return reinclude(filepath);
                        else
                            return false;
                    });
                },
                loader: 'babel-loader',
                enforce: 'pre',
            },
            { test: /\.vue$/, loader: '@vusion/vue-loader', options: vueOptions },
            { test: /\.vue[\\/]index\.js$/, loader: 'vue-multifile-loader', options: vueOptions },
            { test: /\.css$/, use: cssRule },
            // svg in `dev.js` and `build.js`
            { test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/, loader: 'file-loader', options: { name: '[name].[hash:16].[ext]' } },
        ],
    },
    plugins,
    stats: {
        colors: true,
        modules: false,
        children: false,
        chunks: false,
        chunkModules: false,
    },
};

if (config.libraryPath)
    webpackConfig.resolve.alias.library$ = config.libraryPath;
if (config.libraryPath && config.docs && process.env.NODE_ENV !== 'test') {
    const iterator = require('markdown-it-for-inline');

    webpackConfig.entry.docs = require.resolve('@vusion/doc-loader/entry/docs.js');
    webpackConfig.module.rules.push({ test: /\.vue[\\/]index\.js$/, loader: '@vusion/doc-loader' }); // Position below so processing before `vue-multifile-loader`

    webpackConfig.module.rules.push({
        test: /\.vue[\\/]README\.md$/,
        use: [{
            loader: 'vue-loader',
            options: {
                preserveWhitespace: false,
            },
        }, {
            loader: '@vusion/md-vue-loader',
            options: {
                wrapper: 'u-article',
                liveProcess(live, code) {
                    // 不好直接用自定义标签，容易出问题
                    return `<div class="u-example"><div>${live}</div><div slot="code"></div></div>\n\n${code}`;
                },
                postprocess(result) {
                    const re = /<div class="u-example"><div>([\s\S]+?)<\/div><div slot="code"><\/div><\/div>\s+(<pre[\s\S]+?<\/pre>)/g;
                    return result.replace(re, (m, live, code) => `<u-example><div>${live}</div><div slot="code">${code}</div></u-example>\n\n`);
                },
                plugins: [
                    [iterator, 'link_converter', 'link_open', (tokens, idx) => tokens[idx].tag = 'u-link'],
                    [iterator, 'link_converter', 'link_close', (tokens, idx) => tokens[idx].tag = 'u-link'],
                ],
            },
        }],
    });

    webpackConfig.plugins.push(new HTMLWebpackPlugin({
        filename: config.type === 'library' ? 'index.html' : 'docs.html',
        template: path.resolve(require.resolve('@vusion/doc-loader/entry/docs.js'), '../index.html'),
        chunks: ['docs'],
    }));
}

module.exports = webpackConfig;
