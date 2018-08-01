'use strict';

const postcss = require('postcss');

const EXTENDS_START = '==========EXTENDS_START==========';
const EXTENDS_END = '==========EXTENDS_END==========';
const IMPORT_START = '==========IMPORT_START==========';
const IMPORT_END = '==========IMPORT_END==========';

function postcssPlugins() {
    return function (styles, result) {
        walkMarkComments(styles, EXTENDS_START, EXTENDS_END, setOringinName, 'extend');
        walkMarkComments(styles, IMPORT_START, IMPORT_END, setOringinName, 'import');
        const extendsModules = getExtendsModules(styles);
        const hasExtendSelectors = {};
        if (!Object.keys(extendsModules).length)
            return;
        styles.walkRules((rule) => {
            if (rule.originName === 'extend' || rule.originName === 'import')
                return;
            const selectorNames = getSelector(rule);
            // console.log(selectorNames);
            selectorNames.forEach((selectorName) => {
                if (extendsModules.hasOwnProperty(selectorName) && !hasExtendSelectors.hasOwnProperty(selectorName)) {
                    hasExtendSelectors[selectorName] = true;
                    rule.removeSelf = true;
                    const hasSelector = extendsModules[selectorName];
                    const newSelector = rule;
                    copyDecls(newSelector, hasSelector);
                }
            });
        });
        styles.walkRules((rule) => {
            if (rule.removeSelf)
                rule.remove();
        });
    };
}
function getExtendsModules(styles) {
    const selectors = {};
    styles.walkRules((rule) => {
        if (rule.originName === 'extend') {
            const selectorNames = getSelector(rule);
            selectors[selectorNames] = rule;
        }
    });
    return selectors;
}
function setOringinName(root, start, end, name) {
    const nodes = root.nodes;
    for (let i = start + 1; i < end; i++) {
        nodes[i].originName = name;
    }
}
function walkMarkComments(styles, startCommentText, endCommentText, callback, param) {
    let start;
    let end;
    let startComment;
    styles.walkComments((comment) => {
        if (comment.text === startCommentText) {
            startComment = comment;
        } else if (comment.text === endCommentText) {
            if (startComment) {
                start = styles.index(startComment);
                end = styles.index(comment);
                callback(styles, start, end, param);
            }
        }
    });
}
function copyDecls(from, to) {
    const hasDecls = {};
    const nodes = [];
    to.walkDecls((decl) => {
        hasDecls[decl.prop] = decl;
    });
    from.walkDecls((decl) => {
        hasDecls[decl.prop] = decl;
    });
    for (const name of Object.keys(hasDecls))
        nodes.push(hasDecls[name]);
    to.nodes = nodes;
}
function getSelector(rule) {
    if (!rule || !rule.selector)
        return [''];
    const selectors = rule.selectors;
    const parentSelectors = getSelector(rule.parent);
    const result = [];
    parentSelectors.forEach((selector) => {
        selectors.forEach((childSelector) => {
            if (selector === '') {
                result.push(childSelector);
            } else {
                result.push(selector + ' ' + childSelector);
            }
        });
    });
    return result;
}
module.exports = postcss.plugin('postcss-merge', postcssPlugins);
