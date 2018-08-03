'use strict';

const postcss = require('postcss');

const EXTENDS_START = 'EXTENDS_START\n   ==========================================================================';
const EXTENDS_END = 'EXTENDS_END\n   ==========================================================================';
const IMPORT_START = 'IMPORT_START\n   ==========================================================================';
const IMPORT_END = 'IMPORT_END\n   ==========================================================================';

function postcssPlugins() {
    return function (styles, result) {
        styles.walkAtRules((rule) => {
            if (rule.name === 'extends') {
                addMark(styles, rule, EXTENDS_START, EXTENDS_END);
                rule.name = 'import';
            } else if (rule.name === 'import') {
                addMark(styles, rule, IMPORT_START, IMPORT_END);
            }
        });
    };
}
function addMark(styles, rule, start, end) {
    styles.insertBefore(rule, { text: start });
    styles.insertAfter(rule, { text: end });
}
module.exports = postcss.plugin('postcss-vusion-extends-mark', postcssPlugins);
