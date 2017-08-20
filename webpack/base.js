const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const VusionDocPlugin = require('vusion-doc-loader').Plugin;
const IconFontPlugin = require('icon-font-loader').Plugin;

const config = global.vusionConfig;

// Postcss plugins
const postcssPlugins = [
    require('postcss-import'),
    require('precss')({
        path: ['node_modules'],
    }),
    require('postcss-calc'),
    require('autoprefixer')({
        browsers: ['last 4 versions', 'ie >= 9'],
    }),
];

// Vue loader options
const vueOptions = {
    preserveWhitespace: false,
    postcss: postcssPlugins,
    cssModules: {
        importLoaders: 3,
        localIdentName: process.env.NODE_ENV === 'production' ? '[hash:base64:16]' : '[name]_[local]_[hash:base64:8]',
    },
    extractCSS: config.extractCSS && process.env.NODE_ENV === 'production',
};

// CSS loaders options
let cssRule = [
    { loader: 'vusion-css-loader', options: vueOptions.cssModules },
    { loader: 'postcss-loader', options: { plugins: (loader) => postcssPlugins } },
    'import-global-loader',
    'icon-font-loader',
];
if (vueOptions.extractCSS)
    cssRule = ExtractTextPlugin.extract({ use: cssRule, fallback: 'style-loader' });
else
    cssRule.unshift('style-loader');

// Webpack config
const webpackConfig = {
    entry: {
        bundle: './index.js',
    },
    resolve: {
        // @QUESTION: If not put 'node_modules' at last, there are some problem on dependencies
        modules: [path.resolve(__dirname, '../node_modules'), path.resolve(__dirname, '../../'), 'node_modules'],
        alias: { vue$: 'vue/dist/vue.esm.js' },
    },
    resolveLoader: {
        // Put 'node_modules' at first to allow developer to customize loader
        modules: ['node_modules', path.resolve(process.cwd(), 'node_modules'), path.resolve(__dirname, '../node_modules'), path.resolve(__dirname, '../../')],
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
            { test: /\.(png|jpg|gif|svg|ttf|eof|woff|woff2)$/, loader: 'file-loader', options: { name: '[name].[ext]?[hash]' } },
        ],
    },
    plugins: [
        new IconFontPlugin({ fontName: 'vusion-icon-font' }),
    ],
};

if (config.libraryPath)
    webpackConfig.resolve.alias.library$ = config.libraryPath;
if (config.libraryPath && config.docs) {
    webpackConfig.entry.docs = path.resolve(__dirname, '../entry/docs.js');
    webpackConfig.module.rules.push({ test: /\.vue[\\/]index\.js$/, loader: 'vusion-doc-loader' }); // Position below so processing before `vue-multifile-loader`
    webpackConfig.plugins.push(new VusionDocPlugin());
}

module.exports = webpackConfig;
