'use strict';

const postcss = require('postcss');
const { EXTEND_START, EXTEND_END, IMPORT_START, IMPORT_END } = require('./DIVIDERS');

function postcssPlugins() {
    return function (styles, result) {
        styles.walkAtRules((rule) => {
            if (rule.name === 'extend') {
                addMark(styles, rule, EXTEND_START, EXTEND_END);
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

module.exports = postcss.plugin('postcss-vusion-extend-mark', postcssPlugins);
