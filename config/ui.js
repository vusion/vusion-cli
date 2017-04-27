const path = require('path');
const config = require('./base');
const merge = require('../src/merge');

const VusionDocPlugin = require('vusion-doc-loader/VusionDocPlugin');

module.exports = merge(config, {
    output: {
        path: path.resolve(process.cwd(), global.vusionConfig.docsPath),
        publicPath: '/',
        filename: '[name].js',
        library: 'VusionUI',
        libraryTarget: 'umd',
    },
    module: {
        EXTENDS: true,
        rules: [
            'EXTENDS',
            { test: /\.vue[\\/]index\.js$/, loader: 'vusion-doc-loader' }, // Position below so processing before `vue-multifile-loader`
        ],
    },
    plugins: [
        new VusionDocPlugin(),
    ],
});
