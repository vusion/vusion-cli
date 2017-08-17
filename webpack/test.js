const config = require('./base');
const merge = require('../lib/merge');

const webpackConfig = merge(config, {
    devtool: '#inline-source-map',
});

delete webpackConfig.entry;
module.exports = webpackConfig;
