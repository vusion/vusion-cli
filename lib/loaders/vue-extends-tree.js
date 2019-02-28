const fs = require('fs-extra');
const path = require('path');
const babel = require('babel-core');

const caches = {};

class JSFile {
    // extends;
    constructor(options) {
        Object.assign(this, options);
    }
}

function loadJSFile(fullPath) {
    if (caches[fullPath])
        return Promise.resolve(caches[fullPath]);
    else {
        return fs.readFile(fullPath, 'utf8').then((content) => {
            const isVue = fullPath.endsWith('.vue');
            if (isVue) {
                const found = content.match(/<script>([\s\S]+)<\/script>/);
                content = found ? found[1] : '';
            }

            const jsFile = new JSFile({
                fullPath,
                content,
                babelResult: babel.transform(content),
                isVue,
            });

            caches[fullPath] = jsFile;
            return jsFile;
        });
    }
}

function findExtendsName(objectNode) {
    const extendsProperty = objectNode.properties.find((property) => property.key.name === 'extends' && property.value.type === 'Identifier');
    if (!extendsProperty)
        throw new Error('Cannot find extends');
    return extendsProperty.value.name;
}

/**
 * Find vue object recursively
 * @param {*} result - Babel result
 * @param {*} identifier
 * @param {*} exported - find from exports
 * @param {*} recursive
 * @return { objectNode, fullPath }
 */
function findVueObject(fullPath, identifier = 'default', exported = false, recursive = false) {
    let promise;
    if (fullPath instanceof JSFile) {
        promise = Promise.resolve(fullPath);
        fullPath = fullPath.fullPath;
    } else
        promise = loadJSFile(fullPath);
    return promise.then((jsFile) => {
        const babelResult = jsFile.babelResult;

        if (identifier === 'default') {
            const exportDefault = babelResult.ast.program.body.find((node) => node.type === 'ExportDefaultDeclaration');
            if (!exportDefault)
                throw new Error('Cannot find export default');

            if (exportDefault.declaration.type === 'ObjectExpression')
                return {
                    objectNode: exportDefault.declaration,
                    jsFile,
                    identifier,
                };
            else if (exportDefault.declaration.type === 'Identifier') {
                const exportDefaultName = exportDefault.declaration.name;
                return findVueObject(jsFile, exportDefaultName);
            }
        } else {
            if (exported) {
                const exportsNode = babelResult.metadata.modules.exports;
                const exportSpecifier = exportsNode.specifiers.find((specifier) => specifier.exported === identifier);
                if (!exportSpecifier)
                    throw new Error('Cannot find identifier in exports: ' + identifier);
                identifier = exportSpecifier;
            }

            if (recursive) {
                // find in imports
                let importSpecifier;
                const importsNode = babelResult.metadata.modules.imports.find((impt) => impt.specifiers.some((specifier) => {
                    if (specifier.local === identifier)
                        importSpecifier = specifier;
                    return specifier.local === identifier;
                }));
                if (importSpecifier) {
                    let importPath = path.resolve(fullPath, '../', importsNode.source);
                    if (importPath.endsWith('.vue') && fs.statSync(importPath).isDirectory())
                        importPath += '/index.js';
                    return findVueObject(importPath, importSpecifier.imported, true, true);
                }
            }

            // find in body
            return {
                objectNode: babelResult.ast.program.body.find((node) => node.type === 'ObjectExpression' && node.name === identifier),
                jsFile,
                identifier,
            };
        }
    });
}

function findSuper(fullPath) {
    return findVueObject(fullPath, 'default').then(({ objectNode, jsFile, identifier }) => {
        if (jsFile.extends) // Cached
            return jsFile.extends;

        const extendsName = objectNode ? findExtendsName(objectNode) : identifier;
        if (!extendsName)
            throw new Error('Cannot find extends name');

        return findVueObject(jsFile, extendsName, false, true).then((result) => {
            if (!result.objectNode)
                throw new Error('Cannot find vue object');

            jsFile.extends = result.jsFile;
            return result.jsFile;
        });
    });
}

function buildTree(entry) {
    // @TODO
    // @TODO: watch deps
    // @TODO: circular deps
}

module.exports = {
    JSFile,
    findExtendsName,
    findVueObject,
    findSuper,
};
