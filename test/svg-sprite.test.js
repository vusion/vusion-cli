const path = require('path');
const { expect } = require('chai');
const rm = require('rimraf').sync;
const execa = require('execa');
const shell = require('shelljs');
const fs = require('fs');

describe('test svg sprite in build mode', () => {
    const buildCLI = path.join(__dirname, '../bin/vusion-build');
    const svgPath = path.resolve(__dirname, './fixtures/svg-sprite');
    before(() => {
        shell.cd(svgPath);
    });

    after(() => {
        rm('public');
    });

    it('should generate sprite svg with "?sprite" and those without "?sprite" should generate svg file as well', (done) => {
        let result;
        let files;
        execa(buildCLI).then((res) => {
            result = res;
            files = fs.readdirSync('public');

            expect(result.code).to.equal(0);
            expect(files).to.eql(['index.js', 'sprite.8b1043c7e9dd0844.svg']);
            done();
        }).catch(done);
    });

    it('should sprite all svg if all of them require with "?sprite"', (done) => {
        let result;
        let files;
        execa(buildCLI, ['-e', './index1.js']).then((res) => {
            result = res;
            files = fs.readdirSync('public');

            expect(result.code).to.equal(0);
            expect(files).to.eql(['bundle.js', 'logo.8b1043c7e9dd0844.svg']);
            done();
        }).catch(done);
    });
});
