const path = require('path');
const fs = require('fs');
const glob = require('glob');
const tcpPortUsed = require('tcp-port-used');
const merge = require('./merge');
const { Server } = require('karma');
const selectorPath = path.resolve(__dirname, '../node_modules/vusion-vue-loader/lib/selector');
const srcPath = path.resolve(process.cwd(), './src');

const config = global.vusionConfig;

const checkPort = async (host, port) => {
    await tcpPortUsed.check(port, host)
        .then((used) => {
            if (used)
                return checkPort(host, port + 1);
            else
                return port;
        });
};

const filterVueTest = () => {
    const vueFilesWithTest = glob.sync(srcPath + '/**/*.vue').filter((file) => fs.readFileSync(file, 'utf8').match(/<test>((.|\r|\n)*)<\/test>/));
    return vueFilesWithTest;
};

const prepareConfig = () => {
    const vueFilesWithTest = filterVueTest();
    let js = fs.readFileSync(path.resolve(__dirname, './requireTestTemplate.js'), 'utf8');
    js = js.replace('/* VUECONTEXT_REPLACER */', (match) => {
        let result = vueFilesWithTest.length > 0 ? '' : match;
        vueFilesWithTest.forEach((filePath, index) => {
            const regPath = path.relative(srcPath, filePath).replace(/\//g, '\\/').replace('.', '\\.');

            result += `
const vueContext${index} = require.context('${selectorPath}?type=customBlocks&index=0!${srcPath}', true, /${regPath}/);
vueContext${index}.keys().forEach(vueContext${index});
            `;
        });
        return result;
    }).replace('jsPath', `'${path.resolve(process.cwd(), './test/unit')}'`);
    fs.writeFileSync(path.resolve(__dirname, './requireTest.js'), js);
};

const defaultTestConfig = {
    files: [
        path.resolve(__dirname, './requireTest.js'),
    ],
    preprocessors: {
        [path.resolve(__dirname, './requireTest.js')]: ['webpack', 'sourcemap'],
    },
    webpack: {
        resolve: {

        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    loader: 'babel-loader',
                    exclude: /node_modules/,
                },
            ],
        },
        devtool: '#inline-source-map',
    },
    webpackMiddleware: {
        noInfo: true,
    },
    frameworks: ['mocha', 'chai'],
    browsers: ['Chrome'],
    reporters: ['progress'],
    singleRun: true,
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
