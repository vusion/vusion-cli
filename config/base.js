const path = require('path');

const vueOptions = {
    preserveWhitespace: false,
    postcss: [
        require('postcss-import'),
        require('precss')({
            path: ['node_modules'],
        }),
        require('postcss-calc'),
        require('autoprefixer')({
            browsers: ['last 4 versions', 'ie >= 9'],
        }),
    ],
    cssModules: {
        localIdentName: '[name]_[local]',
    },
    extractCSS: global.vusionConfig.extractCSS && process.env.NODE_ENV === 'production',
};

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
            'vue-style-loader': 'vusion-style-loader',
        },
    },
    devtool: '#eval-source-map',
    module: {
        rules: [
            { test: /\.vue$/, loader: 'vusion-vue-loader', options: vueOptions },
            { test: /\.vue[\\/]index\.js$/, loader: 'vue-multifile-loader', options: vueOptions },
            { test: /\.(png|jpg|gif|svg)$/, loader: 'file-loader', options: {
                name: '[name].[ext]?[hash]',
            } },
        ],
    },
};
