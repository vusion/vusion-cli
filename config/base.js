const path = require('path');

const vueOptions = {
    preserveWhitespace: false,
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
        alias: { vue$: 'vue/dist/vue.esm.js' },
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
            { test: /\.vue\/index\.js$/, loader: 'vision-doc-loader' }, // Position below and Processing before `vue-multifile-loader`
            {
                test: /\.css$/, loader: 'css-loader',
                options: {
                    localIdentName: '[name]_[local]',
                    getLocalIdent(context, localIdentName, localName, options) {
                        // A temp solution
                        if (localName === 'root')
                            localIdentName = localIdentName.replace(/_\[local\]/gi, '');
                        else
                            localIdentName = localIdentName.replace(/\[local\]/gi, localName);

                        return localIdentName;
                    },
                },
            },
            { test: /\.(png|jpg|gif|svg)$/, loader: 'file-loader', options: {
                name: '[name].[ext]?[hash]',
            } },
        ],
    },
};
