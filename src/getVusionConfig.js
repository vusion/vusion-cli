const fs = require('fs');
const path = require('path');

const vusionConfigPath = path.join(process.cwd(), 'vusion.config.js');
if (fs.existsSync(vusionConfigPath))
    module.exports = require(vusionConfigPath);
