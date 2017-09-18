const targetRegx = 'background:\\s*url\\(("([^"]+)"|\'([^\']+)\'|([^\'")]+))\\);';

const getRelativeFilePath = (value) => {
    const relativePathResult = new RegExp(targetRegx).exec(value);
    if (!relativePathResult)
        throw new Error(`Could not parse url "${value}".`);

    return relativePathResult[2] || relativePathResult[3] || relativePathResult[4];
};

module.exports = function (content) {
    this.cacheable();

    content = content.replace(new RegExp(targetRegx, 'g'), (match) => {
        const relativePath = getRelativeFilePath(match);

        if (relativePath.match(/\.svg$/)) {
            return match + '\n' + [
                'background-repeat: no-repeat;',
                'background-position: center;',
                'background-size: contain',
            ].join('\n');
        } else
            return match;
    });

    return content;
};
