const fs = require('fs');
const path = require('path');

const vusionConfigPath = path.join(process.cwd(), 'vusion.config.js');
const boardConfigPath = path.join(process.cwd(), 'board.config.js');
const serverConfigPath = path.join(process.cwd(), 'server.config.js');
let vusion, board, server;

if (fs.existsSync(vusionConfigPath))
    vusion = require(vusionConfigPath);
if (fs.existsSync(boardConfigPath))
    board = require(boardConfigPath);
if (fs.existsSync(serverConfigPath))
    server = require(serverConfigPath);

module.exports = {
    vusion,
    board,
    server,
};
