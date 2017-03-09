const path = require('path');
const webpack = require('webpack');
const babelConfig = require('../.babelrc.js');

const vueOptions = {
    babel: babelConfig,
    postcss: [
        require('postcss-import'),
        require('precss')({
            path: ['node_modules'],
        }),
        require('autoprefixer')({
            browsers: ['last 4 versions', 'ie >= 9'],
        }),
    ],
    cssModules: {
        localIdentName: '[name]_[local]',
    },
};

module.exports = {
    entry: {
        bundle: './index.js',
    },
    resolve: {
        modules: [path.join(__dirname, '../node_modules'), 'node_modules'],
        alias: { 'vue$': 'vue/dist/vue.esm.js' },
    },
    resolveLoader: {
        modules: [path.join(__dirname, '../node_modules'), 'web_loaders', 'web_modules', 'node_loaders', 'node_modules'],
        alias: {
            'css-loader': 'vision-css-loader',
            'vue-loader': 'vision-vue-loader',
            'vue-style-loader': 'vision-style-loader',
        },
    },
    devtool: '#eval-source-map',
    module: {
        rules: [
            { test: /\.vue$/, loader: 'vision-vue-loader', options: vueOptions },
            { test: /\.vue\/index\.js$/, loader: 'vue-multifile-loader', options: vueOptions },
            {
                test: /\.js$/,
                exclude: /node_modules(.+)(?!\.vue\/index\.js$)/,
                loader: 'babel-loader',
                options: babelConfig,
                enforce: 'pre', // for vue-multifile-loader
            }, {
                test: /\.css$/, loader: 'css-loader',
                options: {
                    localIdentName: '[name]_[local]',
                    getLocalIdent(context, localIdentName, localName, options) {
                        console.log('!!!!', context);
                        console.log('!!!!', options);
                        // A temp solution
                        if (localName === 'root')
                            localIdentName = localIdentName.replace(/_\[local\]/gi, '');
                        else
                            localIdentName = localIdentName.replace(/\[local\]/gi, localName);

                        return localIdentName;
                    }
                }
            },
            { test: /\.(png|jpg|gif|svg)$/, loader: 'file-loader', options: {
                name: '[name].[ext]?[hash]',
            }},
        ],
    },
};
