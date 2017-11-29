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
    else if (fs.existsSync(packagePath)) {
        const packageVusion = require(packagePath).vusion;
        if (packageVusion)
            Object.assign(config, packageVusion);
        else {
            console.error('Cannot find vusion config! This is not a vusion project.\n');
            console.error('processCwd:', process.cwd());
            console.error('configPath:', configPath);
            process.exit(1);
        }
    }

    if (!TYPES.includes(config.type)) {
        console.error('Unknown project type!');
        process.exit(1);
    }

    if (config.type === 'library') {
        config.libraryPath = config.libraryPath || './src';
        config.docs = true;
    }
    if (config.libraryPath)
        config.libraryPath = path.resolve(process.cwd(), config.libraryPath);

    return config;
};
