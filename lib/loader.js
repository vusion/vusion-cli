const path = require('path');

module.exports = function (content) {
    const loadersPath = {
        'file-loader': require.resolve('file-loader'),
        'markdown-it-loader': require.resolve('markdown-it-loader'),
    }


    const filepath = this.resourcePath;
    const dirname = path.dirname(filepath);

    const mdpath = path.join(dirname, 'index.md');
    console.log(filepath);

    const outputs = [];

    if (fs.existsSync(mdpath))
        outputs.push(`var __vision_doc__ = require('!!${loadersPath['file-loader']}!${loadersPath['markdown-it-loader']}!${mdpath}');`)

    return outputs.join('\n');
}
