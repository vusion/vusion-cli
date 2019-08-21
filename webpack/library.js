const path = require('path');
const baseConfig = require('./base');
const merge = require('../lib/merge');
const config = global.vusionConfig;

const name = config.name || 'bundle';

const webpackConfig = merge(baseConfig, {
    entry: {
        index: [config.baseCSSPath, './index.js'],
    },
    output: {
        path: path.join(process.cwd(), 'dist'),
        // Use relative public path by default
        filename: '[name].js',
        chunkFilename: 'chunk.[name].[chunkhash:16].js',
        library: config.CamelName || 'Library',
        libraryTarget: 'umd',
        umdNamedDefine: true,
    },
    externals: {
        vue: {
            root: 'Vue',
            commonjs: 'vue',
            commonjs2: 'vue',
            amd: 'vue',
        },
    },
});

module.exports = webpackConfig;
