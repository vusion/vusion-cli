'use strict';

const semver = require('semver');
const chalk = require('chalk');
const pkg = require('../package.json');
const exec = (cmd) => require('child_process').execSync(cmd).toString().trim();

const versionRequirements = [{
    name: 'node',
    currentVersion: semver.clean(process.version),
    versionRequirement: pkg.engines.node,
}, {
    name: 'npm',
    currentVersion: exec('npm --version'),
    versionRequirement: pkg.engines.npm,
}];

module.exports = function () {
    const warnings = [];
    versionRequirements.forEach((mod) => {
        if (!semver.satisfies(mod.currentVersion, mod.versionRequirement))
            warnings.push(`${mod.name}: ${chalk.red(mod.currentVersion)} should be ${chalk.green(mod.versionRequirement)}`);
    });

    if (warnings.length) {
        console.log('');
        console.log(chalk.yellow('To use this template, you must update following to modules:'));
        console.log();

        warnings.forEach((warning) => console.log('  ' + warning));
        console.log();
        process.exit(1);
    }
};
