const path = require('path');

const cssExtendRE = /^@extend;/im;
const { VueExtendsTree } = require('./VueExtendsTree');
const vueExtendsTree = new VueExtendsTree();

module.exports = function (content) {
    const callback = this.async();
    this.cacheable();

    const found = content.match(cssExtendRE);
    if (!found)
        return callback(null, content);

    let jsPath;
    if (this.resourcePath.endsWith('.vue/module.css'))
        jsPath = path.join(this.resourcePath, '../index.js');
    else
        jsPath = this.resourcePath;

    vueExtendsTree.loader = this;
    vueExtendsTree.findSuper(jsPath).then((supr) => {
        if (supr.isVue)
            throw new Error('Unsupport auto extend for single vue files');

        const superCSSPath = path.relative(path.join(this.resourcePath, '../'), path.join(supr.fullPath, '../module.css'));
        content = content.slice(0, found.index) + `@extend '${superCSSPath}';` + content.slice(found.index + 8);
        callback(null, content);
    }).catch((e) => callback(e));
};
