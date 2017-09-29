const path = require('path');
const port = 10086;

module.exports = {
    type: 'app',
    webpack: {
        entry: {
            index: './index.js',
        },
        output: {
            EXTENDS: true,
            publicPath: `/public/`,
        },
    },
};
