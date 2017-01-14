const fs = require('fs');
const path = require('path');
const loaderUtils = require('loader-utils');

const vueMultiFileLoaderPath = require.resolve('./vue-multi-file-loader.js');

loaderUtils.queryStringify = (query) => {
    return Object.keys(query).map((key) => key + '=' + query[key]).join('&');
};

module.exports = function (content) {
    this.cacheable();

    const query = loaderUtils.parseQuery(this.query);

    const vuePath = path.dirname(this.resourcePath);
    const vueName = path.basename(vuePath, '.vue');
    const vueDir = path.dirname(vuePath);

    const markdownPath = path.join(vuePath, 'index.md');
    const stylePath = path.join(vuePath, 'index.css');

    const outputs = [];
    if (fs.existsSync(markdownPath)) {
        const outputPath = '../' + path.join(query.docsPath, path.relative(process.cwd() + '/src', vueDir)) + '/';
        const fileLoaderQuery = loaderUtils.queryStringify({
            name: vueName + '.html',
            outputPath,
            // publicPath
        });
        outputs.push('var __vision_doc__ = require(' + loaderUtils.stringifyRequest(this, `!!file-loader?${fileLoaderQuery}!markdown-it-loader!${vueMultiFileLoaderPath}?type=md!${vuePath}`) + ');');
    }

    outputs.push('module.exports = require(' + loaderUtils.stringifyRequest(this, `!!vue-loader!${vueMultiFileLoaderPath}!${vuePath}`) + ');');
    return outputs.join('\n');
}
