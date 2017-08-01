const config = require('./base');
const merge = require('../lib/merge');

module.exports = merge(config, {
    output: {
        path: process.cwd(),
        publicPath: '/',
        filename: '[name].js',
    },
});
