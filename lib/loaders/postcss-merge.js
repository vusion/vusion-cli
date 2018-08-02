'use strict';

const postcss = require('postcss');

const EXTENDS_START = 'EXTENDS_START\n   ==========================================================================';
const EXTENDS_END = 'EXTENDS_END\n   ==========================================================================';
const IMPORT_START = 'IMPORT_START\n   ==========================================================================';
const IMPORT_END = 'IMPORT_END\n   ==========================================================================';

function postcssMerge() {
    return function (styles, result) {
        walkMarkComments(styles, EXTENDS_START, EXTENDS_END, setOringinName, 'extend');
        const extendsModules = getExtendsModules(styles);
        if (Object.keys(extendsModules).length) {
            walkMarkComments(styles, IMPORT_START, IMPORT_END, setOringinName, 'import');
            extendsRules(styles, extendsModules);
            deleteProp(styles);
        }
    };
}
function extendsRules(styles, extendsModules) {
    const hasExtendSelectors = {};
    styles.walkRules((rule) => {
        if (rule.originName === 'extend' || rule.originName === 'import')
            return;
        const selectorNames = getSelector(rule);
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
}
function deleteProp(styles) {
    styles.walkRules((rule) => {
        if (rule.originName === 'extend' || rule.originName === 'import')
            delete rule.originName;
        if (rule.removeSelf)
            rule.remove();
    });
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
    root.walkRules((rule) => {
        const index = root.index(rule);
        if (start < index && index < end) {
            rule.originName = name;
        }
    });
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
module.exports = postcss.plugin('postcss-merge', postcssMerge);
