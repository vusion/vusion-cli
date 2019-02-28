const path = require('path');
const babel = require('babel-core');

class JSFile {
    // extends;
    constructor(options) {
        Object.assign(this, options);
    }
}

class VueExtendsTree {
    constructor(options) {
        // Pass loader
        this.caches = {};
        Object.assign(this, options);
    }

    build() {
    // @TODO
    // @TODO: watch deps
    // @TODO: circular deps
    }

    loadJSFile(fullPath) {
        if (this.caches[fullPath])
            return Promise.resolve(this.caches[fullPath]);
        else {
            return new Promise((resolve, reject) => {
                this.loader.fs.readFile(fullPath, (err, content) => {
                    if (err)
                        return reject(err);

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

                    this.caches[fullPath] = jsFile;
                    return resolve(jsFile);
                });
            });
        }
    }

    findExtendsName(objectExpression) {
        const extendsProperty = objectExpression.properties.find((property) => property.key.name === 'extends' && property.value.type === 'Identifier');
        if (!extendsProperty)
            throw new Error('Cannot find extends');
        return extendsProperty.value.name;
    }

    importVueObject(fullPath, sourcePath, identifier) {
        return new Promise((resolve, reject) => {
            this.loader.resolve(path.dirname(fullPath), sourcePath, (err, importPath) => {
                if (err)
                    return reject(err);

                if (importPath.endsWith('.vue') && this.loader.fs.statSync(importPath).isDirectory())
                    importPath += '/index.js';
                return resolve(this.findVueObject(importPath, identifier, true, true));
            });
        });
    }

    /**
     * Find vue object recursively
     * @param {*} result - Babel result
     * @param {*} identifier
     * @param {*} exported - find from exports
     * @param {*} recursive
     * @return { objectExpression, jsFile, identifier }
     */
    findVueObject(fullPath, identifier = 'default', exported = false, recursive = false) {
        let promise;
        if (fullPath instanceof JSFile) {
            promise = Promise.resolve(fullPath);
            fullPath = fullPath.fullPath;
        } else
            promise = this.loadJSFile(fullPath);
        return promise.then((jsFile) => {
            const babelResult = jsFile.babelResult;

            if (identifier === 'default') {
                const exportDefault = babelResult.ast.program.body.find((node) => node.type === 'ExportDefaultDeclaration');
                if (!exportDefault)
                    throw new Error('Cannot find export default');

                if (exportDefault.declaration.type === 'ObjectExpression')
                    return {
                        objectExpression: exportDefault.declaration,
                        jsFile,
                        identifier,
                    };
                else if (exportDefault.declaration.type === 'Identifier') {
                    const exportDefaultName = exportDefault.declaration.name;
                    return this.findVueObject(jsFile, exportDefaultName);
                }
            } else {
                if (exported) {
                    const exportsNode = babelResult.metadata.modules.exports;
                    const externalAllSpecifiers = [];
                    const exportSpecifier = exportsNode.specifiers.find((specifier) => {
                        if (specifier.kind === 'local' && specifier.exported === identifier)
                            return true;
                        if (specifier.kind === 'external-all')
                            externalAllSpecifiers.push(specifier);
                        return false;
                    });
                    if (exportSpecifier)
                        identifier = exportSpecifier.local;
                    else if (recursive)
                        return Promise.all(externalAllSpecifiers.map((specifier) => this.importVueObject(fullPath, specifier.source, identifier)))
                            .then((results) => results.find((result) => !!result.objectExpression));
                    else
                        throw new Error('Cannot find identifier in exports: ' + identifier);
                }

                if (recursive) {
                    // find in imports
                    let importSpecifier;
                    const importsNode = babelResult.metadata.modules.imports.find((impt) => impt.specifiers.some((specifier) => {
                        if (specifier.local === identifier) {
                            importSpecifier = specifier;
                            return true;
                        } else
                            return false;
                    }));
                    if (importSpecifier)
                        return this.importVueObject(fullPath, importsNode.source, importSpecifier.imported);
                }

                // find in body
                let objectExpression;
                babelResult.ast.program.body.some((node) => {
                    if (node.type !== 'VariableDeclaration')
                        return false;
                    return node.declarations.some((declaration) => {
                        if (declaration.id.name === identifier && declaration.init.type === 'ObjectExpression') {
                            objectExpression = declaration.init;
                            return true;
                        } else
                            return false;
                    });
                });

                return {
                    objectExpression,
                    jsFile,
                    identifier,
                };
            }
        });
    }

    findSuper(fullPath) {
        return this.findVueObject(fullPath, 'default').then(({ objectExpression, jsFile, identifier }) => {
            if (jsFile.extends) // Cached
                return jsFile.extends;

            const extendsName = objectExpression ? this.findExtendsName(objectExpression) : identifier;
            if (!extendsName)
                throw new Error('Cannot find extends name');

            return this.findVueObject(jsFile, extendsName, false, true).then((result) => {
                if (!result.objectExpression)
                    throw new Error('Cannot find vue object');

                jsFile.extends = result.jsFile;
                return result.jsFile;
            });
        });
    }
}

module.exports = {
    JSFile,
    VueExtendsTree,
};
