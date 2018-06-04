// https://github.com/tj/commander.js/issues/802

module.exports = parseCommander;

const assert = require('assert');

/**
 * parse commander and add some property to program
 * @param {*} program
 * @returns {*} program - add program.extraArgs
 */
function parseCommander(program) {
    assert(program, 'parseCommander arg program is required!');
    program.extraArgs = parseCommanderExtra(program);
    return program;
}

/**
 * parse args behind of -- in program.rawArgs
 * @param {object} program - commander parse result
 * @returns {string[]}
 * @private
 */
function parseCommanderExtra(program) {
    const index = program.rawArgs.findIndex((item) => item === '--');

    let extraArgs;
    if (index === -1 || index === program.rawArgs.length - 1)
        extraArgs = [];
    else
        extraArgs = program.rawArgs.splice(index + 1);

    return extraArgs;
}
