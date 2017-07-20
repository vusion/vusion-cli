'use strict';

const path = require('path');
const shell = require('shelljs');
const opn = require('opn');
const tcpPortUsed = require('tcp-port-used');
const merge = require('./merge');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const FriendlyErrors = require('friendly-errors-webpack-plugin');

const checkPort = function (host, port) {
    return tcpPortUsed.check(port, host)
        .then((used) => {
            if (used)
                return checkPort(host, port + 1);
            else
                return port;
        });
};

const start = function (webpackConfig, host, port) {
    const uri = `http://${host}:${port}`;

    webpackConfig = merge(webpackConfig, {
        // eval-source-map is faster for development
        devtool: '#eval-source-map',
        plugins: [
            'EXTENDS',
            new webpack.EnvironmentPlugin({
                NODE_ENV: 'development',
            }),
            new webpack.HotModuleReplacementPlugin(), // hot reload
            // new webpack.NamedModulesPlugin(),
            new webpack.NoEmitOnErrorsPlugin(), // skip errors
            // new FriendlyErrors()
        ],
        performance: { hints: false },
    }, global.vusionConfig.webpack);

    // add hot-reload related code to entry chunks
    Object.keys(webpackConfig.entry).forEach((name) => {
        webpackConfig.entry[name] = [
            require.resolve('webpack-dev-server/client') + '?' + uri,
            require.resolve('webpack/hot/dev-server'),
            webpackConfig.entry[name],
        ];
    });

    // Remove output directory and copy assets
    if (global.vusionConfig.clean) {
        if (webpackConfig.output.path !== process.cwd())
            shell.rm('-rf', webpackConfig.output.path);
        if (global.vusionConfig.assetsPath)
            shell.cp('-r', path.resolve(process.cwd(), global.vusionConfig.assetsPath), webpackConfig.output.path);
    }

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
    }, global.vusionConfig.webpackDevServer));

    /**
     * Start Server
     */
    server.listen(port, host, (err) => {
        if (err)
            return console.error(err);

        console.info('> Listening at ' + uri + '\n');
        opn(uri);
    });
};

module.exports = function (webpackConfig) {
    const host = global.vusionConfig.webpackDevServer.host || 'localhost';
    checkPort(host, global.vusionConfig.webpackDevServer.port || 9000)
        .then((port) => start(webpackConfig, host, port));
};
