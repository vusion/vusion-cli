const path = require('path');
const fs = require('fs');
const glob = require('glob');
const tcpPortUsed = require('tcp-port-used');
const merge = require('./merge');
const { Server } = require('karma');
const selectorPath = path.resolve(__dirname, '../node_modules/vusion-vue-loader/lib/selector');
let srcPath = path.resolve(process.cwd(), './src');
const webpackConfig = require('../webpack/test');

const config = global.vusionConfig;

!!config.webpack && delete config.webpack.entry;

const checkPort = async (host, port) => {
    const used = await tcpPortUsed.check(port, host);
    if (used)
        return checkPort(host, port + 1);
    else
        return port;
};

const getTestFilesPath = () => {
    let testFilesPath = './test/unit';
    if (config.type === 'library') {
        if (fs.existsSync(path.join(process.cwd(), 'packages')))
            testFilesPath = './packages';
        else if (fs.existsSync(path.join(process.cwd(), 'src')))
            testFilesPath = './src';
        srcPath = path.join(process.cwd(), testFilesPath);
    }
    return testFilesPath;
};

const filterVueTest = () => {
    const vueFilesWithTest = glob.sync(srcPath + '/**/*.vue').filter((file) => !file.includes('node_modules')
        && fs.lstatSync(file).isFile()
        && fs.readFileSync(file, 'utf8').match(/<test>[\s\S]*<\/test>/));
    return vueFilesWithTest;
};

const prepareConfig = () => {
    const testFilesPath = getTestFilesPath();
    const vueFilesWithTest = filterVueTest();
    let js = fs.readFileSync(path.resolve(__dirname, './requireTestTemplate.js'), 'utf8');
    js = js.replace('/* VUECONTEXT_REPLACER */', (match) => {
        let result = vueFilesWithTest.length > 0 ? '' : match;
        vueFilesWithTest.forEach((filePath, index) => {
            const regPath = path.relative(srcPath, filePath).replace(/\//g, '\\/').replace('.', '\\.');

            result += `
            const vueContext${index} = require.context('!!${selectorPath}?type=customBlocks&index=0!${srcPath}', true, /${regPath}/);
            vueContext${index}.keys().forEach(vueContext${index});
            `;
        });
        return result;
    }).replace('jsPath', `'${path.resolve(process.cwd(), testFilesPath)}'`);
    fs.writeFileSync(path.join(__dirname, `./requireTest.js`), js);
};

const defaultTestConfig = {
    files: [
        path.join(__dirname, `./requireTest.js`),
    ],
    preprocessors: {
        [path.join(__dirname, `./requireTest.js`)]: ['webpack', 'sourcemap'],
    },
    webpack: merge(webpackConfig, config.webpack),
    webpackMiddleware: {
        noInfo: true,
    },
    frameworks: ['mocha', 'chai'],
    browsers: ['Electron'],
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
};

const startKarma = (port) => {
    prepareConfig();
    const karmaConfig = merge(defaultTestConfig, config.karma, {
        port,
    });
    const server = new Server(karmaConfig, (exitCode) => {
        /* eslint-disable no-console */
        console.log(`Karma has exited with ${exitCode}`);
        /* eslint-enable no-console */
        process.exit(exitCode);
    });
    server.start();
};

module.exports = function () {
    checkPort('localhost', config.karma.port || 9876)
        .then((port) => startKarma(port));
};
