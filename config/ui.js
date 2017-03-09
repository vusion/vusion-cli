const path = require('path');
const config = require('./base');

module.exports = Object.assign(config, {
    output: {
        path: path.resolve(process.cwd(), global.visionConfig.docsPath),
        publicPath: '/',
        filename: '[name].js',
        library: 'VisionUI',
        libraryTarget: 'umd',
    },
    externals: {
        'vue': {
            root: 'Vue',
            amd: 'Vue',
            commonjs: 'vue',
            commonjs2: 'vue',
        },
    },
});
