const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

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

const vueOptions = {
    preserveWhitespace: false,
    postcss: postcssPlugins,
    cssModules: {
        localIdentName: process.env.NODE_ENV === 'production' ? '[hash:base64:16]' : '[name]_[local]_[hash:base64:8]',
    },
    extractCSS: global.vusionConfig.extractCSS && process.env.NODE_ENV === 'production',
};

let cssRule = [
    { loader: 'vusion-css-loader', options: { importLoaders: 1 } },
    { loader: 'postcss-loader', options: { plugins: (loader) => postcssPlugins } },
    'import-global-loader',
];

if (vueOptions.extractCSS)
    cssRule = ExtractTextPlugin.extract({ use: cssRule, fallback: 'style-loader' });
else
    cssRule.unshift('style-loader');

module.exports = {
    entry: {
        bundle: './index.js',
    },
    resolve: {
        // @QUESTION: If not put 'node_modules' at last, there are some problem on dependencies
        modules: [path.join(__dirname, '../node_modules'), 'node_modules'],
        alias: { vue$: 'vue/dist/vue.esm.js' },
    },
    resolveLoader: {
        // Put 'node_modules' at first to allow developer to customize loader
        modules: ['node_modules', path.join(process.cwd(), 'node_modules'), path.join(__dirname, '../node_modules')],
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
            { test: /\.(png|jpg|gif|svg)$/, loader: 'file-loader', options: {
                name: '[name].[ext]?[hash]',
            } },
        ],
    },
};
