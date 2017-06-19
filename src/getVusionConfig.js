const fs = require('fs');
const path = require('path');

module.exports = function (relativePath = 'vusion.config.js') {
    const configPath = path.join(process.cwd(), relativePath);
    if (fs.existsSync(configPath))
        return require(configPath);
};
