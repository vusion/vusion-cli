/* eslint-disable no-multi-spaces */
module.exports = {
    type: '',                       // Vusion project type. Required option. 'library', 'app'
    assetsPath: '',                 // Path of assets, which will be copied into destination directory
    clean: true,                    // Clean the destination directory before `dev` or `build`
    libraryPath: '',                // Library entry path. To be `./index.js` by default if project type is `library`
    docs: false,                    // Generate docs of common components in library. Always be true if project type is `library`
    open: true,                     // Enable/Disable to open browser at the beginning in `dev` mode
    hot: true,                      // Enable/Disable to hot reload in `dev` mode
    sourceMap: false,               // Generate sourceMap in `build` mode
    extractCSS: false,              // Extract CSS via ExtractTextPlugin in `build` mode
    uglifyJS: false,                // Compress JS via UglifyJSPlugin only in `build` mode
    experimental: false,            // Enable some experimental loaders or plugins, like ModuleConcatenationPlugin
    webpack: {},                    // Extend webpack configuration
    webpackDevServer: {},           // Extend webpackDevServer configuration
    karma: {},                      // Extend karma configuration
};
