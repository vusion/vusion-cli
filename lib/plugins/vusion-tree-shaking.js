'use strict';

const HARMONY_IMPORT = 'harmony import'; // corresponding to import statement, e.g import ** as yyy from 'xxx'; or import 'zzz';
const HARMONY_IMPORT_SPECIFIER_TYPE = 'harmony import specifier'; // corresponding to import default from 'xxx';
const HARMONY_EXPORT_IMPORTED_SPECIFIER_TYPE = 'harmony export imported specifier'; // export what has been imported bofore;
const CJS_REQUIRE = 'cjs require';
const toBeRemovedResources = [];
const unDeadModuleNames = [];
let unDeadLibModules;
let targetModule;
let unDeadStyles;

class TsPlugin {
    constructor(options) {
        this.options = Object.assign({
            shakingRequest: './r',
            whiteList: [''],
        }, options);
    }

    apply(compiler) {
        compiler.plugin('this-compilation', (compilation) => {
            compilation.plugin('optimize-chunks', (chunks) => {
                chunks.forEach((chunk) => {
                    const modules = chunk.mapModules();
                    const target = this.options.shakingRequest;
                    const entryModule = chunk.entryModule;
                    targetModule = modules.find((e) => e.rawRequest === target);

                    if (!targetModule)
                        return;

                    targetModule.reasons.forEach((reason) => {
                        reason.module.dependencies.forEach((dep) => {
                            if (dep.type === HARMONY_IMPORT_SPECIFIER_TYPE && dep.importDependency.request === this.options.shakingRequest && dep.id)
                                unDeadModuleNames.push(dep.name);
                        });
                    });
                    unDeadLibModules = this.findUndeadModules(targetModule);
                    this.analyzeUnDeadLibModules(unDeadLibModules, compilation);
                    unDeadLibModules = [...unDeadLibModules.values()];
                    this.findUndeadStyles(unDeadLibModules);
                    unDeadLibModules.forEach((module) => this.markModuleUnDead(module));
                    this.markModuleUnDead(entryModule);
                    targetModule.isUnDead = true;

                    this.markModuleNeedToBeRemoved(targetModule);
                    chunk.mapModules((c) => c).forEach((module) => {
                        if (toBeRemovedResources.includes(module.resource)) {
                            // module._source._value = '';
                            module.removeChunk(chunk);
                            // module.resource.endsWith('.js') && (module._source._value = 'export default {};');
                            // removedChunk.addModule(module);
                            // module.addChunk(removedChunk);
                            // module.rewriteChunkInReasons(
                            //     chunk,
                            //     [newEntryChunk],
                            // );
                            // Object.assign(module, {
                            //     userRequest: modules[0].userRequest,
                            //     resource: modules[0].resource,
                            // });
                            // targetModuleSrc.dependencies.forEach((dep, i, deps) => {
                            //     if (dep.module && dep.module.resource === module.resource) {
                            //         dep.request = dep.userRequest = './u-icon.vue';
                            //         Object.assign(dep.module, {
                            //             userRequest: modules[0].userRequest,
                            //             resource: modules[0].resource,
                            //         });
                            //     }
                            // });
                            // compilation.rebuildModule(module, (err) => {
                            //     callback();
                            // });
                        }
                    });
                });

                // const entrypoint = new Entrypoint('removed');
                // entrypoint.chunks.push(removedChunk);
                // removedChunk.entrypoints = [entrypoint];

                // newEntryChunk.chunks = [removedChunk].concat(chunks);
                // newEntryChunk.chunks.forEach((chunk) => {
                //     chunk.parents = [newEntryChunk];
                //     chunk.entrypoints.forEach((ep) => {
                //         ep.insertChunk(newEntryChunk, chunk);
                //     });
                //     newEntryChunk.addChunk(chunk);
                // });
            });
            compilation.plugin('optimize-module-ids', (modules) => {
                // set unused module's id to 0
                modules.forEach((module) => {
                    const resource = (module.rootModule && module.rootModule.resource || module.resource);
                    if (toBeRemovedResources.includes(resource))
                        module.id = 0;
                });
            });
        });
    }

    findUndeadModules(module, modulesMap = new Map()) {
        module.dependencies.forEach((m) => {
            if (m.type === HARMONY_EXPORT_IMPORTED_SPECIFIER_TYPE && m.id === null) { // export * from 'xxx'
                m.importDependency.module.isUnDead = true;
                this.findUndeadModules(m.importDependency.module, modulesMap);
            }
        });
        module.dependencies.forEach((dep, i, deps) => {
            if (dep.type === HARMONY_EXPORT_IMPORTED_SPECIFIER_TYPE && (!unDeadModuleNames.length || unDeadModuleNames.includes(dep.name)))
                modulesMap.set(dep.name, dep.importDependency.module);
            else if (dep.type === HARMONY_IMPORT && !deps.map((dep) => dep.importDependency).filter(Boolean).includes(dep)) // just import 'xxx' without export
                modulesMap.set(dep.module.resource, dep.module);
            return undefined;
        });
        return modulesMap;
    }

    findUndeadStyles(modules) {
        unDeadStyles = modules.map((m) => {
            const styleModuleDep = m.dependencies.find((d) => d.type === CJS_REQUIRE && d.request.includes('extract-text'));
            let styleModuleResource;
            if (styleModuleDep && (styleModuleResource = styleModuleDep.module.resource).includes('node_modules'))
                return styleModuleResource;
            return '';
        }).filter(Boolean);
    }

    markModuleUnDead(module, depth = 0) {
        depth++;
        if (module.isUnDead || module === targetModule)
            return;
        const hasImportDep = module.dependencies.some((m) => m.type.includes('import') || m.type.includes(CJS_REQUIRE));
        const resource = module.resource || '';
        module.isUnDead = true;
        if (depth > 3 && resource.endsWith('.css') && resource.includes('node_modules') && !unDeadStyles.includes(resource))
            module.isUnDead = false;
        if (hasImportDep) {
            module.dependencies.forEach((dep) => {
                if (!dep.module)
                    return;
                this.markModuleUnDead(dep.module, depth);
            });
        }
    }

    markModuleNeedToBeRemoved(module) {
        const hasImportDep = module.dependencies.some((m) => m.type.includes('import') || m.type.includes(CJS_REQUIRE));

        module.dependencies.forEach((m) => {
            if (m.type === HARMONY_EXPORT_IMPORTED_SPECIFIER_TYPE && m.id === null)
                this.markModuleNeedToBeRemoved(m.importDependency.module);
        });

        if (hasImportDep) {
            module.dependencies.forEach((dep) => {
                if (!dep.module || this.options.whiteList.includes(dep.request))
                    return;
                if (!dep.module.isUnDead && !toBeRemovedResources.includes(dep.module.resource))
                    toBeRemovedResources.push(dep.module.resource);
                this.markModuleNeedToBeRemoved(dep.module);
            });
        }
    }

    analyzeUnDeadLibModules(libModulesMaps, compilation) {
        const moduleInfo = [];
        const implicitTagNameRegx = /_c\(('|")(u-.+?)\1/;
        const camelRegx = /^[A-Z]/;
        const formatCamel = (m, p1) => '-' + p1.toLowerCase();
        libModulesMaps.forEach((module, key) => {
            const infoObj = {
                tagName: key && key.match(camelRegx) ? 'u' + key.replace(/([A-Z])/g, formatCamel) : '',
                implictTags: [],
            };
            module.dependencies.forEach((dep) => {
                if (dep.type === HARMONY_IMPORT) {
                    const source = dep.module.originalSource();
                    const request = dep.request;
                    if (request.endsWith('.html') || request.endsWith('.vue') && request.includes('type=template')) {
                        const match = source._value.match(implicitTagNameRegx);
                        if (match)
                            infoObj.implictTags.push(match[2]);
                    }
                }
            });
            moduleInfo.push(infoObj);
        });
        moduleInfo.forEach((info, i, infos) => {
            info.implictTags.length && info.implictTags.forEach((tag) => !infos.map((info) => info.tagName).includes(tag) && compilation.errors.push(new Error(`vusion build: you should import ${tag} as well`)));
        });
    }
}

module.exports = TsPlugin;
