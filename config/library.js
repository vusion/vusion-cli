const path = require('path');
const config = require('./base');
const merge = require('../src/merge');

module.exports = merge(config, {
    output: {
        path: path.join(process.cwd(), 'public'),
        publicPath: '/',
        filename: '[name].js',
        library: 'VusionUI',
        libraryTarget: 'umd',
    },
});
