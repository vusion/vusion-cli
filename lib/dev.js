'use strict';

const path = require('path');
const shell = require('shelljs');
const opn = require('opn');
const tcpPortUsed = require('tcp-port-used');
const merge = require('./merge');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
// const FriendlyErrors = require('friendly-errors-webpack-plugin');

const config = global.vusionConfig;

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
    const url = `http://${host}:${port}`;

    /**
     * Webpack config
     */
    const plugins = [
        'EXTENDS',
        new webpack.EnvironmentPlugin({
            NODE_ENV: 'development',
        }),
        // new webpack.NamedModulesPlugin(),
        new webpack.NoEmitOnErrorsPlugin(), // skip errors
        // new FriendlyErrors()
    ];

    config.hot && plugins.push(new webpack.HotModuleReplacementPlugin());

    webpackConfig = merge(webpackConfig, {
        // eval-source-map is faster for development
        devtool: '#eval-source-map',
        plugins,
        performance: { hints: false },
    }, config.webpack);

    // add hot-reload related code to entry chunks
    config.hot && Object.keys(webpackConfig.entry).forEach((name) => {
        webpackConfig.entry[name] = [
            require.resolve('webpack-dev-server/client') + '?' + url,
            require.resolve('webpack/hot/dev-server'),
            webpackConfig.entry[name],
        ];
    });

    // Remove output directory and copy assets
    if (config.clean) {
        if (webpackConfig.output.path !== process.cwd())
            shell.rm('-rf', webpackConfig.output.path);
        if (config.assetsPath)
            shell.cp('-r', path.resolve(process.cwd(), config.assetsPath), webpackConfig.output.path);
    }

    /**
     * WebpackDevServer Config
     */
    const compiler = webpack(webpackConfig);
    const server = new WebpackDevServer(compiler, Object.assign({
        contentBase: webpackConfig.output.path,
        publicPath: webpackConfig.output.publicPath || '',
        // noInfo: true,
        hot: config.hot,
        inline: true,
        historyApiFallback: true,
        stats: { colors: true },
    }, config.webpackDevServer));

    /**
     * Start Server
     */
    server.listen(port, host, (err) => {
        if (err)
            return console.error(err);

        console.info('> Listening at ' + url + '\n');
        !process.env.TEST && opn(url);
        process.send && process.send(config);
    });
};

module.exports = function (webpackConfig) {
    const host = config.webpackDevServer.host || 'localhost';
    checkPort(host, config.webpackDevServer.port || 9000)
        .then((port) => start(webpackConfig, host, port));
};
