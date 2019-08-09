const path = require('path');
const merge = require('../lib/merge');

const ExtractTextWebpackPlugin = require('extract-text-webpack-plugin');
const IconFontPlugin = require('icon-font-loader').Plugin;
const CSSSpritePlugin = require('css-sprite-loader').Plugin;
const VueComponentAnalyzerPlugin = require('vue-component-analyzer/src/VueComponentAnalyzerPlugin');
const postcssImportResolver = require('postcss-import-resolver');

const importGlobalLoaderPath = require.resolve('../lib/loaders/import-global-loader');
const postcssVusionExtendMark = require('../lib/postcss/extend-mark');
const postcssVusionExtendMerge = require('../lib/postcss/extend-merge');
const postcssVariablesReaderPath = require.resolve('../lib/postcss/variables-reader');

const config = global.vusionConfig;

let resolveModules;
if (config.resolvePriority === 'cwd')
    resolveModules = [path.resolve(process.cwd(), 'node_modules'), path.resolve(__dirname, '../node_modules'), path.resolve(__dirname, '../../'), 'node_modules'];
else if (config.resolvePriority === 'current')
    resolveModules = ['node_modules', path.resolve(process.cwd(), 'node_modules'), path.resolve(__dirname, '../node_modules'), path.resolve(__dirname, '../../')];
else
    resolveModules = [path.resolve(__dirname, '../node_modules'), path.resolve(__dirname, '../../'), 'node_modules'];

const postcssImportAlias = Object.assign({}, config.webpack.resolve ? config.webpack.resolve.alias : {});
delete postcssImportAlias.EXTENDS;

const postcssExtendMark = postcssVusionExtendMark({
    resolve: postcssImportResolver({
        extensions: ['.js'],
        alias: postcssImportAlias,
        modules: resolveModules,
    }),
});

// Postcss plugins
const postcssPlugins = [
    postcssExtendMark,
    require('postcss-import')({
        resolve: postcssImportResolver({
            alias: postcssImportAlias,
            modules: resolveModules,
        }),
        skipDuplicates: false,
        plugins: [postcssExtendMark],
    }),
    require('postcss-url')({
        // Rewrite https://github.com/postcss/postcss-url/blob/master/src/type/rebase.js
        // 只需将相对路径变基，其它让 Webpack 处理即可
        url(asset, dir) {
            if (asset.url[0] !== '.')
                return asset.url;

            let rebasedUrl = path.normalize(path.relative(dir.to, asset.absolutePath));
            rebasedUrl = path.sep === '\\' ? rebasedUrl.replace(/\\/g, '/') : rebasedUrl;
            rebasedUrl = `${rebasedUrl}${asset.search}${asset.hash}`;

            if (asset.url.startsWith('..'))
                return rebasedUrl;
            else
                return './' + rebasedUrl;
        },
    }),
    // precss removed
    require('postcss-variables'),
    require('postcss-preset-env')({
        stage: 0,
        browsers: config.browsers,
        features: {
            'image-set-function': false, // handle by css-sprite-loader
            'color-mod-function': true, // stage is -1, https://github.com/csstools/cssdb/blob/master/cssdb.json
        },
    }),
    // precss removed
    require('postcss-calc'),
    postcssVusionExtendMerge,
].concat(config.postcss);

// Vue loader options
const vueOptions = merge({
    preserveWhitespace: false,
    postcss: postcssPlugins,
    cssModules: {
        importLoaders: process.env.NODE_ENV === 'production' ? 6 : 4,
        localIdentName: '[name]_[local]_[hash:base64:8]',
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

const variablesRules = [
    postcssVariablesReaderPath,
    { loader: 'postcss-loader', options: { plugins: (loader) => postcssPlugins } },
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
        fontName: config.name ? config.name + '-icon' : 'vusion-icon',
        filename: '[name].[hash:16].[ext]',
        mergeDuplicates: process.env.NODE_ENV === 'production',
    }, config.options.IconFontPlugin)),
    new VueComponentAnalyzerPlugin(),
];
// Only generate sprites in production mode
if (process.env.NODE_ENV === 'production') {
    plugins.push(new CSSSpritePlugin(Object.assign({
        imageSetFallback: true,
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
        alias: {
            vue$: path.resolve(process.cwd(), 'node_modules/vue/dist/vue.esm.js'), // Problems will happen if vue in two different places
            globalCSS: config.globalCSSPath,
            baseCSS: config.baseCSSPath,
            library$: config.libraryPath, // @deprecated
            '@': config.srcPath,
            '@@': config.libraryPath,
            '~': process.cwd(),
        },
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
            { test: /\.vue$/, loader: '@vusion/vue-loader', options: vueOptions },
            { test: /\.vue[\\/]index\.js$/, loader: 'vue-multifile-loader', options: vueOptions },
            { test: /\.css$/, oneOf: [
                { resourceQuery: /variables/, use: variablesRules },
                { test: /\.css$/, use: cssRule },
            ] },

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

if (config.lint) {
    webpackConfig.module.rules.push({
        test: /\.(js|vue)$/,
        exclude: /node_modules/,
        loader: 'eslint-loader',
        enforce: 'pre',
        options: {
            eslintPath: path.resolve(process.cwd(), 'node_modules/eslint'),
            formatter: require('eslint-friendly-formatter'),
        },
    });
}

if (process.env.NODE_ENV === 'production' || config.babel) {
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
    });
}

module.exports = webpackConfig;
