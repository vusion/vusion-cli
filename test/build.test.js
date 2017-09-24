const path = require('path');
const { expect } = require('chai');
const execa = require('execa');
const rm = require('rimraf').sync;
const fs = require('fs');

describe('command: build', () => {
    const initCli = path.join(__dirname, '../bin/vusion-init');
    const buildCli = path.join(__dirname, '../bin/vusion-build');
    const originalCwd = process.cwd();
    let projectRoot;

    const setup = () => {
        process.chdir(path.join(__dirname, './mock-vusion-project'));
    };

    const teardown = (done) => {
        process.chdir(projectRoot);
        rm('*');
        process.chdir(originalCwd);
        done();
    };

    describe('build app type vusion project', () => {
        let result;
        let files;
        before((done) => {
            setup();
            execa(initCli, ['app', 'app-project'])
                .then((res) => {
                    projectRoot = process.cwd();
                    process.chdir(path.join(projectRoot, './app-project'));
                    return execa('npm', ['i']);
                })
                .then((res) => execa(buildCli))
                .then((res) => {
                    result = res;
                    files = fs.readdirSync('public');
                    done();
                })
                .catch(done);
        });

        after(teardown);

        it('should build with expected files', () => {
            const bundleJs = files.find((file) => file.includes('bundle.js'));
            expect(bundleJs).to.equal('bundle.js');
            expect(result.code).to.equal(0);
        });
    });

    describe('build library type vusion project', () => {
        let result;
        let files;
        before((done) => {
            setup();
            execa(initCli, ['library', 'library-project'])
                .then((res) => {
                    projectRoot = process.cwd();
                    process.chdir(path.join(projectRoot, './library-project'));
                    return execa('npm', ['i']);
                })
                .then((res) => execa(buildCli))
                .then((res) => {
                    result = res;
                    files = fs.readdirSync('public');
                    done();
                })
                .catch(done);
        });

        after(teardown);

        it('should build with expected files', () => {
            expect(files).to.include.members(['bundle.js', 'docs.js', 'index.html']);
            expect(files).to.have.lengthOf(7);
            expect(result.code).to.equal(0);
        });
    });
});
