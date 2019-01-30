const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

const TYPES = ['library', 'app', 'html5', 'fullstack'];
const defaults = require('./defaults');

function getConfig(configPath, packagePath) {
    delete require.cache[configPath];
    delete require.cache[packagePath];
    if (fs.existsSync(configPath))
        return require(configPath);
    else if (fs.existsSync(packagePath)) {
        const packageVusion = require(packagePath).vusion;
        if (packageVusion)
            return packageVusion;
        else {
            throw new Error(`Cannot find vusion config! This is not a vusion project.
    processCwd: ${process.cwd()}
    configPath: ${configPath}
`);
        }
    }
}

module.exports = function resolve(configPath = 'vusion.config.js') {
    const config = defaults;

    const packagePath = config.packagePath = path.resolve(process.cwd(), 'package.json');
    configPath = config.configPath = path.resolve(process.cwd(), configPath);
    Object.assign(config, getConfig(configPath, packagePath));

    if (!TYPES.includes(config.type)) {
        throw new TypeError('Unknown project type!');
    }

    if (config.type === 'library') {
        config.libraryPath = config.libraryPath || './src';
        config.docs = config.docs || {};

        if (process.env.NODE_ENV === 'development') {
            // 更新 docs 对象
            chokidar.watch([configPath, packagePath]).on('change', (path) => {
                const newConfig = getConfig(configPath, packagePath);
                config.docs = newConfig.docs || {};
            });
        }
    } else
        config.libraryPath = config.libraryPath;

    config.srcPath = config.srcPath || './src';

    if (config.libraryPath) {
        config.libraryPath = path.resolve(process.cwd(), config.libraryPath);

        if (!config.globalCSSPath) {
            config.globalCSSPath = path.resolve(config.libraryPath, './base/global.css');
            if (!fs.existsSync(config.globalCSSPath))
                config.globalCSSPath = path.resolve(config.srcPath, './base/global.css');
            if (!fs.existsSync(config.globalCSSPath))
                config.globalCSSPath = path.resolve(require.resolve('@vusion/doc-loader'), '../components/base/global.css');
        }
        if (!config.baseCSSPath) {
            config.baseCSSPath = path.resolve(config.libraryPath, './base/base.css');
            if (!fs.existsSync(config.baseCSSPath))
                config.baseCSSPath = path.resolve(config.srcPath, './base/global.css');
            if (!fs.existsSync(config.baseCSSPath))
                config.baseCSSPath = path.resolve(require.resolve('@vusion/doc-loader'), '../components/base/base.css');
        }
    } else // For Compatiblity
        config.globalCSSPath = './global.css';

    return config;
};
