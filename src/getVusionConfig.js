const fs = require('fs');
const path = require('path');

const TYPES = ['library', 'app', 'html5', 'full-stack'];

module.exports = function (relativePath = 'vusion.config.js') {
    const config = {
        type: '',
        clean: true,
        hot: true,
        sourceMap: false,
        extractCSS: false,
        uglifyJS: false,
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
        if (!config.assetsPath)
            config.assetsPath = './src/assets';
        if (!config.docsPath)
            config.docsPath = './docs';
    }

    return config;
};
