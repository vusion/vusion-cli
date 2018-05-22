const path = require('path');
const config = require('./base');
const merge = require('../lib/merge');

module.exports = merge(config, {
    entry: {
        bundle: './index.js',
        // docs
    },
    output: {
        path: path.join(process.cwd(), 'public'),
        // Use relative public path by default
        // publicPath: '',
        filename: '[name].js',
        chunkFilename: 'chunk.[name].[chunkhash:16].js',
        library: 'Library',
        libraryTarget: 'umd',
    },
});
