const fs = require('fs');
const path = require('path');
const merge = require('../lib/merge');

const ExtractTextPlugin = require('extract-text-webpack-plugin');
const IconFontPlugin = require('icon-font-loader').Plugin;
const HTMLWebpackPlugin = require('html-webpack-plugin');

const importGlobalLoaderPath = require.resolve('../lib/loaders/import-global-loader');
const svgSpriteLoaderPath = require.resolve('../lib/loaders/svg-sprite-loader');

const config = global.vusionConfig;

// Postcss plugins
const postcssPlugins = [
    require('postcss-import'),
    require('postcss-url')({
        // Must start with `./`
        // Rewrite https://github.com/postcss/postcss-url/blob/master/src/type/rebase.js
        url(asset, dir) {
            let rebasedUrl = path.normalize(path.relative(dir.to, asset.absolutePath));
            rebasedUrl = path.sep === '\\' ? rebasedUrl.replace(/\\/g, '/') : rebasedUrl;
            return `./${rebasedUrl}${asset.search}${asset.hash}`;
        },
    }),
    require('precss')({
        path: ['node_modules'],
    }),
    require('postcss-calc'),
    require('autoprefixer')({
        browsers: ['last 4 versions', 'ie >= 9'],
    }),
].concat(config.postcss);

// Vue loader options
const vueOptions = merge({
    preserveWhitespace: false,
    postcss: postcssPlugins,
    cssModules: {
        importLoaders: 3,
        localIdentName: process.env.NODE_ENV === 'production' ? '[hash:base64:16]' : '[name]_[local]_[hash:base64:8]',
    },
    extractCSS: config.extractCSS && process.env.NODE_ENV === 'production',
    preLoaders: {
        css: svgSpriteLoaderPath + '!' + importGlobalLoaderPath,
    },
    midLoaders: {
        css: 'icon-font-loader',
    },
}, config.vue);

// CSS loaders options
let cssRule = [
    { loader: 'vusion-css-loader', options: vueOptions.cssModules },
    'icon-font-loader',
    { loader: 'postcss-loader', options: { plugins: (loader) => postcssPlugins } },
    svgSpriteLoaderPath,
    importGlobalLoaderPath,
];
if (vueOptions.extractCSS)
    cssRule = ExtractTextPlugin.extract({ use: cssRule, fallback: 'style-loader' });
else
    cssRule.unshift('style-loader');

let resolveModules;
if (config.resolvePriority === 'cwd')
    resolveModules = [path.resolve(process.cwd(), 'node_modules'), path.resolve(__dirname, '../node_modules'), path.resolve(__dirname, '../../'), 'node_modules'];
else
    resolveModules = [path.resolve(__dirname, '../node_modules'), path.resolve(__dirname, '../../'), 'node_modules'];

// Webpack config
const webpackConfig = {
    entry: {
        bundle: './index.js',
    },
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
            'css-loader': 'vusion-css-loader',
            'vue-loader': 'vusion-vue-loader',
        },
    },
    devtool: '#eval-source-map',
    module: {
        rules: [
            { test: /\.vue$/, loader: 'vusion-vue-loader', options: vueOptions },
            { test: /\.vue[\\/]index\.js$/, loader: 'vue-multifile-loader', options: vueOptions },
            { test: /\.css$/, use: cssRule },
            // svg in `dev.js` and `build.js`
            { test: /\.(png|jpg|gif|eot|ttf|woff|woff2)$/, loader: 'file-loader', options: { name: '[name].[hash:16].[ext]' } },
        ],
    },
    plugins: [
        new IconFontPlugin({ fontName: 'vusion-icon-font', mergeDuplicates: process.env.NODE_ENV === 'production' }),
    ],
};

// Babel
if (fs.existsSync(path.resolve(process.cwd(), '.babelrc'))) {
    webpackConfig.module.rules.unshift({
        test: /\.js$/,
        exclude: (filepath) => {
            const babelIncludes = Array.isArray(config.babelIncludes) ? config.babelIncludes : [config.babelIncludes];
            const reincludes = [
                /\.(?:vue|vusion)[\\/].*\.js$/,
                /\.es6\.js$/,
            ].concat(babelIncludes);

            return filepath.includes('node_modules') && !reincludes.some((reinclude) => {
                if (typeof reinclude === 'string')
                    return filepath.startsWith(reinclude);
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
    });
}

if (config.libraryPath)
    webpackConfig.resolve.alias.library$ = config.libraryPath;
if (config.libraryPath && config.docs && process.env.NODE_ENV !== 'test') {
    const hljs = require('highlight.js');
    const iterator = require('markdown-it-for-inline');

    webpackConfig.entry.docs = require.resolve('vusion-doc-loader/entry/docs.js');
    // webpackConfig.module.rules.push({ test: /\.vue[\\/]index\.js$/, loader: 'vusion-doc-loader' }); // Position below so processing before `vue-multifile-loader`

    webpackConfig.module.rules.push({
        test: /\.vue[\\/]README\.md$/,
        use: [{
            loader: 'vue-loader',
            options: {
                preserveWhitespace: false,
            },
        }, {
            loader: 'vue-markdown-html-loader',
            options: {
                wrapper: 'u-article',
                // livePattern: {
                //     exec: (content) => [content, 'anonymous-' + hashSum(content)],
                // },
                // liveTemplateProcessor(template) {
                //     // Remove whitespace between tags
                //     template = template.trim().replace(/>\s+</g, '><');
                //     return `<div class="u-example">${template}</div>`;
                // },
                markdownIt: {
                    langPrefix: 'lang-',
                    html: true,
                    highlight(str, rawLang) {
                        let lang = rawLang;
                        if (rawLang === 'vue')
                            lang = 'html';

                        if (lang && hljs.getLanguage(lang)) {
                            try {
                                const result = hljs.highlight(lang, str).value;
                                return `<pre class="hljs ${this.langPrefix}${rawLang}"><code>${result}</code></pre>`;
                            } catch (e) {}
                        }

                        return '';
                        // const result = this.utils.escapeHtml(str);
                        // return `<pre class="hljs"><code>${result}</code></pre>`;
                    },
                },
                markdownItPlugins: [
                    [iterator, 'link_converter', 'link_open', (tokens, idx) => tokens[idx].tag = 'u-link'],
                    [iterator, 'link_converter', 'link_close', (tokens, idx) => tokens[idx].tag = 'u-link'],
                ],
            },
        }],
    });

    webpackConfig.plugins.push(new HTMLWebpackPlugin({
        filename: config.type === 'library' ? 'index.html' : 'docs.html',
        template: path.resolve(require.resolve('vusion-doc-loader/entry/docs.js'), '../index.html'),
        chunks: ['docs'],
    }));
}

module.exports = webpackConfig;
