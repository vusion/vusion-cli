const fs = require('fs');
const path = require('path');

module.exports = function (content) {
    this.cacheable();

    const config = global.vusionConfig;
    const globalPath = config.globalCSSPath ? path.resolve(process.cwd(), config.globalCSSPath) : path.resolve(process.cwd(), 'global.css');

    let relativePath = path.relative(path.dirname(this.resourcePath), globalPath);
    if (!relativePath.includes('/'))
        relativePath = './' + relativePath;
    this.addDependency(globalPath);
    if (fs.existsSync(globalPath))
        content = `@import '${relativePath}';\n` + content;
    return content;
};
