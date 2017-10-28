const fs = require('fs');
const path = require('path');

const TYPES = ['library', 'app', 'html5', 'fullstack'];
const defaults = require('./defaults');

module.exports = function (configPath = 'vusion.config.js') {
    const config = defaults;

    const packagePath = path.resolve(process.cwd(), 'package.json');
    configPath = path.resolve(process.cwd(), configPath);
    if (fs.existsSync(configPath))
        Object.assign(config, require(configPath));
    else if (fs.existsSync(packagePath))
        Object.assign(config, require(packagePath).vusion);

    if (!TYPES.includes(config.type)) {
        console.error('process.cwd:', process.cwd());
        console.error('configPath:', configPath);
        throw new Error('Unknown project type!');
    }

    if (config.type === 'library') {
        config.libraryPath = config.libraryPath || './src';
        config.docs = true;
    }
    if (config.libraryPath)
        config.libraryPath = path.resolve(process.cwd(), config.libraryPath);

    return config;
};
