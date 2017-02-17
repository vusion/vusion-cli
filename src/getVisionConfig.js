const fs = require('fs');
const path = require('path');

const visionConfigPath = path.join(process.cwd(), 'vision.config.js');
if (fs.existsSync(visionConfigPath))
    module.exports = require(visionConfigPath);
