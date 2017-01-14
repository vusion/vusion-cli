const fs = require('fs');
const path = require('path');
const loaderUtils = require('loader-utils');

const readVueFile = function (vuePath, type) {
    const filePath = path.join(vuePath, 'index.' + type);
    this.addDependency(filePath);

    return new Promise((resolve, reject) => {
        if (fs.existsSync(filePath)) {
            fs.readFile(filePath, 'utf8', (err, data) =>
                err ? reject(err) : resolve(data));
        } else
            resolve(null);
    });
};

module.exports = function (content) {
    this.cacheable();

    const callback = this.async();
    const query = loaderUtils.parseQuery(this.query);

    if (!/\.vue\/index\.js/.test(this.resourcePath))
        throw new Error(this.resourcePath + ' is not a multi-file Vue Component!');

    const vuePath = path.dirname(this.resourcePath);
    const vueName = path.basename(vuePath, '.vue');
    const vueDir = path.dirname(vuePath);

    if (!query.type || query.type === 'vue') {
        Promise.all(['html', 'css'].map((type) => {
            return readVueFile.call(this, vuePath, type);
        })).then((result) => {
            const outputs = [];
            outputs.push(`<script>${content}</script>`);
            result[0] !== null && outputs.push(`<template>${result[0]}</template>`);
            result[1] !== null && outputs.push(`<style>${result[1]}</style>`);

            callback(null, outputs.join('\n'));
        }).catch((err) => callback(err));
    } else {
        readVueFile.call(this, vuePath, query.type)
            .then((result) => callback(null, result))
            .catch((err) => callback(err));
    }
};
