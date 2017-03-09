'use strict';

const path = require('path');
const opn = require('opn');
const tcpPortUsed = require('tcp-port-used');
const merge = require('./merge');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const FriendlyErrors = require('friendly-errors-webpack-plugin');

const ip = '127.0.0.1';

const checkPort = function (port) {
    return tcpPortUsed.check(port, ip)
        .then((used) => {
            if (used)
                return checkPort(port + 1);
            else
                return port;
        });
}

const start = function (webpackConfig, port) {
    const uri = `http://${ip}:${port}`;

    webpackConfig = merge(webpackConfig, global.visionConfig.webpack, {
        //     // eval-source-map is faster for development
        //     devtool: '#eval-source-map',
        plugins: [
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': '"development"',
            }),
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

module.exports = function (webpackConfig) {
    checkPort(global.visionConfig.webpackDevServer.port || 9000)
        .then((port) => start(webpackConfig, port));
};
