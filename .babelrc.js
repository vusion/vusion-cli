module.exports = {
    presets: [[require.resolve('babel-preset-latest'), { modules: false }]],
    // plugins: [require.resolve('babel-plugin-transform-runtime')],
    // comments: false,
    env: {
        test: {
            plugins: [require.resolve('babel-plugin-istanbul')]
        }
    }
}
