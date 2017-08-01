const fs = require('fs');
const path = require('path');

const TYPES = ['library', 'app', 'html5', 'full-stack'];
const defaults = require('./defaults');

module.exports = function (relativePath = 'vusion.config.js') {
    const config = defaults;

    const packagePath = path.join(process.cwd(), 'package.json');
    if (fs.existsSync(packagePath))
        Object.assign(config, require(packagePath).vusion);
    const configPath = path.join(process.cwd(), relativePath);
    if (fs.existsSync(configPath))
        Object.assign(config, require(configPath));

    if (!TYPES.includes(config.type))
        throw new Error('Unknown project type!');

    if (config.type === 'library') {
        config.libraryPath = './index.js';
        config.docs = true;
    }
    if (config.libraryPath)
        config.libraryPath = path.resolve(process.cwd(), config.libraryPath);
    if (config.docs && !config.assetsPath)
        config.assetsPath = path.resolve(__dirname, '../assets');

    return config;
};
