'use strict';

// builtin tooling
const path = require('path');
const loadContent = require('./load-content');
const processContent = require('./process-content');

// external tooling
const postcss = require('postcss');
function AtImport(optionsUser) {
    // const root = path.resolve(options.root);
    const options = Object.assign({
        load: loadContent,
    }, optionsUser);
    return function (styles, result) {
    // debugger;
        options.extendsModule = [];
        options.basePath = path.dirname(styles.source.input.file);
        return parseStyle(result, styles, options).then((extendsModules) => {
            const selectors = {};
            if (extendsModules.length === 0)
                return;
            styles.walkRules((rule) => {
                const selectorNames = getSelector(rule);
                let removeRule = true;
                selectorNames.forEach((selectorName) => {
                    if (!selectors[selectorName]) {
                        selectors[selectorName] = rule;
                        removeRule = false;
                    } else {
                        const hasSelector = selectors[selectorName];
                        const newSelector = rule;
                        copyDecls(newSelector, hasSelector);
                    }
                });
                if (removeRule)
                    rule.remove();
            });
            for (let i = extendsModules.length - 1; i >= 0; i--) {
                const module = extendsModules[i].root;
                module.walkRules((rule) => {
                    const selector = getSelector(rule);
                    const addSelector = selectors[selector];
                    if (addSelector) {
                        copyDecls(addSelector, rule);
                        addSelector.remove();
                    }
                });
                styles.prepend(module.nodes);
            }
        });
    };
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

function parseStyle(result, styles, options) {
    const nodes = styles.nodes;
    const filePaths = [];
    const basePath = options.basePath;
    nodes.forEach((node) => {
        if (node.type === 'atrule' && node.name === 'extends') {
            const fileParams = node.params.replace(/'/g, '"');
            const filePath = path.resolve(basePath, JSON.parse(fileParams));
            if (filePaths.indexOf(filePath) === -1)
                filePaths.push(filePath);
            node.parent.removeChild(node);
        }
    });
    const readPromise = [];
    filePaths.forEach((file) => {
        readPromise.push(options.load(file).then((content) => processContent(result, content, file, options)));
    });
    return Promise.all(readPromise).then((result) => result);
}

module.exports = postcss.plugin('postcss-extends', AtImport);
