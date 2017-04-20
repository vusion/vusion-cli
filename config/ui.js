const path = require('path');
const config = require('./base');
const merge = require('../src/merge');

module.exports = merge(config, {
    output: {
        path: path.resolve(process.cwd(), global.vusionConfig.docsPath),
        publicPath: '/',
        filename: '[name].js',
        library: 'VusionUI',
        libraryTarget: 'umd',
    },
});
