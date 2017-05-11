const path = require('path');
const config = require('./base');
const merge = require('../src/merge');

module.exports = merge(config, {
    output: {
        path: process.cwd(),
        publicPath: '/',
        filename: '[name].js',
    },
});
