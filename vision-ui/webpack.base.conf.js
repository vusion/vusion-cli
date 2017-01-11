const babelConfig = require('../.babelrc.js');

module.exports = {
    entry: './index.js',
    output: {
        path: './dist',
        publicPath: '/dist/',
        filename: 'bundle.js',
        library: 'VisionUI',
        libraryTarget: 'umd',
    },
    // externals: ['vue']
    module: {
        rules: [
            { test: /\.vue$/, loader: require.resolve('vue-loader') },
            { test: /\.js$/, loader: require.resolve('babel-loader'),
                // exclude: /node_modules/,
                // include: /node_modules\/vision-/,
                options: babelConfig,
            },
            { test: /\.(png|jpg|gif|svg)$/, loader: require.resolve('file-loader'), options: {
                name: '[name].[ext]?[hash]',
            }},
        ],
    },
    resolve: {
        alias: { 'vue$': 'vue/dist/vue.common.js' },
    },
    devtool: '#eval-source-map',
    devServer: {
        historyApiFallback: true,
        // noInfo: true,
    },
    performance: { hints: 'warning' },
}
