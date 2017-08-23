const path = require('path');
const fs = require('fs');
const shell = require('shelljs');
const glob = require('glob');
const tcpPortUsed = require('tcp-port-used');
const merge = require('./merge');
const { Server } = require('karma');
const selectorPath = require.resolve('vusion-vue-loader/lib/selector');

const config = global.vusionConfig;

const checkPort = function (host, port) {
    return tcpPortUsed.check(port, host)
        .then((used) => {
            if (used)
                return checkPort(host, port + 1);
            else
                return port;
        });
};

const getSrcPath = () => {
    if (fs.existsSync(path.join(process.cwd(), 'packages')))
        return './packages';
    else if (fs.existsSync(path.join(process.cwd(), 'src')))
        return './src';
};

const filterVueTest = (testPath) => {
    const vueFilesWithTest = glob.sync(testPath + '/**/*.vue').filter((file) => !file.includes('node_modules')
        && fs.lstatSync(file).isFile()
        && fs.readFileSync(file, 'utf8').match(/<test>[\s\S]*<\/test>/));
    return vueFilesWithTest;
};

const prepareRequireTest = () => {
    shell.rm('-f', path.join(__dirname, '__requireTest_*'));

    const srcPath = path.join(process.cwd(), getSrcPath());
    const testPath = path.join(process.cwd(), './test/unit');
    const vueFilesWithTest = filterVueTest(srcPath);

    const requireTestPath = path.join(__dirname, `__requireTest_${Date.now()}.js`);
    let requireTest = fs.readFileSync(path.resolve(__dirname, './requireTestTemplate.js'), 'utf8');
    if (vueFilesWithTest.length) {
        const regPaths = vueFilesWithTest.map((filePath) => path.relative(srcPath, filePath).replace(/([\\/.])/g, '\\$1')).join('|');
        const replacer = `const vueContext = require.context('!!${selectorPath}?type=customBlocks&index=0!${srcPath}', true, /${regPaths}/);
                          vueContext.keys().forEach(vueContext);`;
        requireTest = requireTest.replace('/* VUECONTEXT_REPLACER */', replacer);
    }
    requireTest = requireTest.replace('srcPath', `'${srcPath}'`).replace('testPath', `'${testPath}'`);

    fs.writeFileSync(requireTestPath, requireTest);

    return requireTestPath;
};

const start = (webpackConfig, port) => {
    /**
     * Webpack config
     */
    webpackConfig = merge(webpackConfig, {
        devtool: '#inline-source-map',
    }, config.webpack);

    const requireTestPath = prepareRequireTest();

    /**
     * Karma config
     */
    const karmaConfig = merge({
        files: [requireTestPath],
        preprocessors: {
            [requireTestPath]: ['webpack', 'sourcemap'],
        },
        webpack: webpackConfig,
        webpackMiddleware: { noInfo: true },
        frameworks: ['mocha', 'chai'],
        browsers: ['Chrome'],
        reporters: ['spec'],
        singleRun: true,
        plugins: [
            'karma-chrome-launcher',
            'karma-mocha',
            'karma-spec-reporter',
            'karma-webpack',
            'karma-sourcemap-loader',
            'karma-chai',
        ],
    }, config.karma, {
        port,
    });

    /**
     * Start Karma
     */
    const server = new Server(karmaConfig, (exitCode) => {
        console.info(`Karma has exited with ${exitCode}`);
        process.exit(exitCode);
    });
    server.start();
};

module.exports = function (webpackConfig) {
    checkPort('localhost', config.karma.port || 9876)
        .then((port) => start(webpackConfig, port));
};
