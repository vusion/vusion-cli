const fs = require('fs');
const path = require('path');

const TYPES = ['library', 'app', 'html5', 'full-stack'];

module.exports = function (relativePath = 'vusion.config.js') {
    const config = {
        type: '',
        assetsPath: '',
        clean: true,
        hot: true,
        sourceMap: false,
        extractCSS: false,
        uglifyJS: false,
        experimental: false,
        webpack: {},
        webpackDevServer: {},
    };

    const packagePath = path.join(process.cwd(), 'package.json');
    if (fs.existsSync(packagePath))
        Object.assign(config, require(packagePath).vusion);
    const configPath = path.join(process.cwd(), relativePath);
    if (fs.existsSync(configPath))
        Object.assign(config, require(configPath));

    if (!TYPES.includes(config.type))
        throw new Error('Unknown project type!');

    if (config.type === 'library') {
        config.docs = true;
        if (!config.assetsPath)
            config.assetsPath = './src/assets';
    }

    return config;
};
