const path = require('path');
const config = require('./base');

module.exports = Object.assign(config, {
    output: {
        path: path.resolve(process.cwd(), 'build'),
        publicPath: '/',
        filename: '[name].js',
    },
});
