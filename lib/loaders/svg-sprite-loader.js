const reg = /svg-sprite:\s*url\((["']?)(.+?)["']?\)\s*;/g;

module.exports = function (content) {
    this.cacheable();

    return content.replace(reg, (m, quote, url) =>
        `background: url(${quote}${url}?sprite${quote}) center no-repeat;
         background-size: contain;`
    );
};
