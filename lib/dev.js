'use strict';

const path = require('path');
const shell = require('shelljs');
const opn = require('opn');
const tcpPortUsed = require('tcp-port-used');
const merge = require('./merge');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const internalIp = require('internal-ip');

const createDomain = (options) => {
    const protocol = options.https ? 'https' : 'http';
    const port = options.port;
    const hostname = options.useLocalIp ? internalIp.v4() : options.host;

    // the formatted domain (url without path) of the webpack server
    return options.public ? `${protocol}://${options.public}` : `${protocol}://${hostname}:${port}`;
};

// const FriendlyErrors = require('friendly-errors-webpack-plugin');

const config = global.vusionConfig;

const checkPort = (port, host) =>
    tcpPortUsed.check(port, host)
        .then((used) => (used) ? checkPort(port + 1, host) : port);

const addDevServerEntrypoints = (webpackConfig, devOptions, domain) => {
    const devClient = [require.resolve('webpack-hot-middleware/client') + '?reload=true'];

    if (domain) {
        devClient[0] = `${require.resolve('webpack-dev-server/client')}?${domain}`;
        if (devOptions.hotOnly)
            devClient.push('webpack/hot/only-dev-server');
        else if (devOptions.hot)
            devClient.push('webpack/hot/dev-server');
    }

    [].concat(webpackConfig).forEach((wpOpt) => {
        if (typeof wpOpt.entry === 'object' && !Array.isArray(wpOpt.entry)) {
            Object.keys(wpOpt.entry).forEach((key) => {
                wpOpt.entry[key] = devClient.concat(wpOpt.entry[key]);
            });
        } else if (typeof wpOpt.entry === 'function')
            wpOpt.entry = wpOpt.entry(devClient);
        else
            wpOpt.entry = devClient.concat(wpOpt.entry);
    });
};

const prepare = (webpackConfig, domain) => {
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
        module: {
            EXTENDS: true,
            rules: [
                'EXTENDS',
                { test: /\.svg$/, loader: 'file-loader', options: { name: '[name].[hash:16].[ext]' } },
            ],
        },
    }, config.webpack);

    const devOptions = Object.assign({
        contentBase: webpackConfig.output.path,
        publicPath: webpackConfig.output.publicPath || '',
        // noInfo: true,
        // inline: true,
        hot: config.hot,
        historyApiFallback: true,
        stats: { colors: true },
    }, config.webpackDevServer);

    // Remove output directory and copy static files
    if (config.clean) {
        if (webpackConfig.output.path !== process.cwd())
            shell.rm('-rf', webpackConfig.output.path);
        if (config.staticPath || config.assetsPath)
            shell.cp('-r', path.resolve(process.cwd(), config.staticPath || config.assetsPath), webpackConfig.output.path);
    }

    /**
     * WebpackDevServer Config
     */
    // add hot-reload related code to entry chunks
    config.hot && addDevServerEntrypoints(webpackConfig, devOptions, domain);
    const compiler = webpack(webpackConfig);

    return { compiler, devOptions };
};

module.exports = (webpackConfig) => ({
    start() {
        let options = config.webpackDevServer || {};
        options = {
            host: options.host || 'localhost',
            port: options.port || 9000,
            useLocalIp: options.useLocalIp,
        };

        checkPort(options.port, options.host)
            .then((port) => {
                options.port = port;
                const url = createDomain(options);
                const { compiler, devOptions } = prepare(webpackConfig, url);
                const server = new WebpackDevServer(compiler, devOptions);

                /**
                 * Start Server
                 */
                return new Promise((resolve, reject) => {
                    server.listen(options.port, options.host, (err) => {
                        if (err) {
                            console.error(err);
                            return reject(err);
                        }

                        console.info('> Listening at ' + url + '\n');
                        if (config.open && !process.env.TEST)
                            opn(url);
                        process.send && process.send(config);
                        resolve();
                    });
                });
            }).catch((err) => {
                console.error(err);
            });
    },
});
module.exports.prepare = prepare;
