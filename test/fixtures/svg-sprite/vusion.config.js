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
