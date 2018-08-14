'use strict';

const postcss = require('postcss');
const { EXTENDS_START, EXTENDS_END, IMPORT_START, IMPORT_END } = require('./DIVIDERS');

function postcssPlugins() {
    return function (styles, result) {
        const root = walkMarkComments(styles);
        const mergeRoot = merge(root);
        styles = mergeRoot.body;
        deleteProp(styles);
        cleanRaws(styles);
        // 测试期间先不移除mark
        // removeMark(styles);
    };
}
function merge(root) {
    if (root.children.length !== 0) {
        root.children = root.children.map((node) => merge(node));
    }
    const extendsModules = getExtendModules(root);
    if (!extendsModules)
        return root;
    addRawModules(root);
    const extendsSelectors = getExtendSelectors(extendsModules);
    root.extendsSelectors = extendsSelectors;
    extendsRules(root.raw, extendsSelectors);
    return root;
}
function addRawModules(root) {
    root.raw = getRawModules(root);
}
function getRawModules(root) {
    let nodes = [];
    const style = postcss.parse('');
    root.children.forEach((child) => {
        nodes = nodes.concat(child.body.nodes);
    });
    root.body.walkRules((rule, index) => {
        if (!nodes.includes(rule)) {
            style.nodes.push(rule);
        }
    });
    return style;
}
function getExtendModules(root) {
    let extendNode;
    root.children.forEach((node) => node.type === 'extend' && (extendNode = node));
    return extendNode;
}
function getExtendSelectors(root) {
    const selectors = {};
    root.body.walkRules((rule) => {
        const selectorNames = getSelector(rule);
        selectors[selectorNames] = rule;
    });
    return selectors;
}
function cleanRaws(styles) {
    styles.walk((node) => {
        node.cleanRaws();
    });
}
function extendsRules(styles, extendsModules) {
    const hasExtendSelectors = {};
    styles.walkRules((rule) => {
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
        if (rule.removeSelf)
            rule.remove();
    });
}
function removeMark(styles) {
    const markList = [EXTENDS_START, EXTENDS_END, IMPORT_START, IMPORT_END];
    styles.walkComments((comment) => {
        if (markList.includes(comment.text))
            comment.remove();
    });
}

function walkMarkComments(styles) {
    const commentStack = [];
    const root = { children: [], type: 'root', body: styles };
    let deep = 0;
    let nodes = [];
    let lastNode;
    styles.walkComments((comment, index) => {
        if (!isMarkComment(comment))
            return;
        if (commentStack.length === 0) {
            lastNode && root.children.push(lastNode);
            lastNode = undefined;
            nodes = [];
            commentStack.push(comment);
            deep++;
        } else {
            const startComment = commentStack[commentStack.length - 1];
            if (isPair(startComment, comment)) {
                const type = getType(startComment, comment);
                const startIndex = styles.index(startComment);
                const endIndex = index;
                const body = postcss.parse('');
                body.nodes = styles.nodes.slice(startIndex + 1, endIndex);
                const currentNode = { start: startComment, end: comment, parent: undefined, children: [], type, startIndex, endIndex, deep, body };
                if (lastNode) {
                    if (lastNode.deep === deep) {
                        nodes.push(currentNode);
                    } else if (lastNode.deep === (deep + 1)) {
                        currentNode.children = nodes;
                        currentNode.children.forEach((node) => node.parent = currentNode);
                        nodes = [currentNode];
                    }
                } else {
                    nodes.push(currentNode);
                }
                lastNode = currentNode;
                commentStack.pop();
                deep--;
            } else {
                commentStack.push(comment);
                deep++;
            }
        }
    });
    if (lastNode)
        root.children.push(lastNode);
    return root;
}
function isMarkComment(comment) {
    const markList = [EXTENDS_START, EXTENDS_END, IMPORT_START, IMPORT_END];
    return markList.includes(comment.text);
}
function isPair(start, end) {
    if (start.text === EXTENDS_START && end.text === EXTENDS_END)
        return true;
    if (start.text === IMPORT_START && end.text === IMPORT_END)
        return true;
    return false;
}
function getType(start, end) {
    if (start.text === EXTENDS_START && end.text === EXTENDS_END)
        return 'extend';
    if (start.text === IMPORT_START && end.text === IMPORT_END)
        return 'import';
    return false;
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
module.exports = postcss.plugin('postcss-vusion-extends-merge', postcssPlugins);
