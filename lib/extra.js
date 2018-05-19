// https://github.com/tj/commander.js/issues/802

module.exports = parseCommanderExtra;

const assert = require('assert');

function parseCommanderExtra(program) {
    assert(program instanceof Object, 'program must is Object in parseCommanderExtra');

    // if args has --
    const index = program.rawArgs.findIndex((item) => item === '--');

    let extraArgs;
    if (index === -1 && index !== program.rawArgs.length - 1)
        return program;
    else
        extraArgs = program.rawArgs.splice(index + 1);

    let extraObj = null;
    if (extraArgs.length > 0) {
        extraObj = {};
        extraArgs.forEach((item) => {
            item = camelcase(item);
            if (item.includes('=')) {
                const [key, value] = item.split('=');
                extraObj[key] = value;
            } else
                extraObj[item] = true;
        });
    }

    program.extraArgs = extraArgs;
    program.extraObj = extraObj;
    return program;
}

function camelcase(flag) {
    return flag.split('-').reduce((str, word) => str + word[0].toUpperCase() + word.slice(1));
}
