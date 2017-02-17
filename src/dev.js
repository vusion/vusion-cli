'use strict';

const path = require('path');
const opn = require('opn');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const FriendlyErrors = require('friendly-errors-webpack-plugin');

module.exports = function (webpackConfig, port) {
    const uri = 'http://localhost:' + port;

    webpackConfig = Object.assign(webpackConfig, global.visionConfig.webpack, {
        //     // eval-source-map is faster for development
        //     devtool: '#eval-source-map',
        plugins: [
            // new webpack.DefinePlugin({
            //     'process.env': 'development',
            // }),
            new webpack.HotModuleReplacementPlugin(), // hot reload
            // new webpack.NamedModulesPlugin(),
            new webpack.NoEmitOnErrorsPlugin(), // skip errors
        //         // https://github.com/ampedandwired/html-webpack-plugin
        //         // new HtmlWebpackPlugin({
        //         //     filename: 'index.html',
        //         //     template: 'index.html',
        //         //     inject: true
        //         // }),
        //         new FriendlyErrors()
        ],
        performance: { hints: false },
    });

    // add hot-reload related code to entry chunks
    Object.keys(webpackConfig.entry).forEach((name) => {
        webpackConfig.entry[name] = [
            require.resolve('webpack-dev-server/client') + '?' + uri,
            require.resolve('webpack/hot/dev-server'),
            webpackConfig.entry[name],
        ];
    });

    /**
     * Start Run Webpack
     */
    const compiler = webpack(webpackConfig);
    const server = new WebpackDevServer(compiler, Object.assign({
        contentBase: webpackConfig.output.path,
        // noInfo: true,
        hot: true,
        inline: true,
        historyApiFallback: true,
        stats: { colors: true },
    }, global.visionConfig.webpackDevServer));

    /**
     * Start Server
     */
    server.listen(port, (err) => {
        if (err)
            return console.log(err);

        console.log('> Listening at ' + uri + '\n');
        opn(uri);
    });
};
