const path = require('path');
const config = require('./base');

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
    isServer: true,
};

module.exports = Object.assign(config, {
    output: {
        path: path.resolve(process.cwd(), 'dist'),
        publicPath: '/',
        filename: '[name].js',
    },
    module: {
        rules: [
            { test: /\.vue$/, loader: 'vusion-vue-loader', options: vueOptions },
            { test: /\.vue[\\/]index\.js$/, loader: 'vue-multifile-loader', options: vueOptions },
            { test: /\.(png|jpg|gif|svg)$/, loader: 'file-loader', options: {
                name: '[name].[ext]?[hash]',
            } },
        ],
    },
});
