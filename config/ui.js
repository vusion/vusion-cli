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
    plugins: [
        new VusionDocPlugin(),
    ],
});
