// https://github.com/tj/commander.js/issues/802

const assert = require('assert');

/**
 * @param {string[]} rawArgs
 * @returns {string[]}
 * @private
 */
function getExtraArgs(args) {
    const index = args.indexOf('--');

    if (!~index || index === args.length - 1)
        return [];
    else
        return args.splice(index + 1);
}

/**
 * @param {*} program
 * @returns {*} program - add program.extraArgs
 */
function parseExtra(program) {
    assert(program, 'program is required for parsing!');
    program.extraArgs = getExtraArgs(program.rawArgs);
    return program;
}

module.exports = parseExtra;
