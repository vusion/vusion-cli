/* eslint-disable no-multi-spaces */
module.exports = {
    type: '',                       // Vusion project type. Required option. 'library', 'app'
    staticPath: '',                 // Path of assets, which will be copied into destination directory
    assetsPath: '',                 // @deprecated, alias of option `staticPath`
    clean: true,                    // Clean the destination directory before `dev` or `build`
    libraryPath: '',                // Library entry path. To be `./index.js` by default if project type is `library`
    docs: false,                    // Generate docs of common components in library. Always be true if project type is `library`
    open: true,                     // Enable/Disable to open browser at the beginning in `dev` mode
    hot: true,                      // Enable/Disable to hot reload in `dev` mode
    sourceMap: false,               // Generate sourceMap in `build` mode
    extractCSS: false,              // Extract CSS via ExtractTextPlugin in `build` mode
    uglifyJS: false,                // Compress JS via UglifyJSPlugin only in `build` mode
    experimental: false,            // Enable some experimental loaders or plugins, like ModuleConcatenationPlugin
    resolveOrder: 'cwd',            // Order of resolving modules or loaders, "cwd"(default) or "cli"
    webpack: {},                    // Extend webpack configuration
    webpackDevServer: {},           // Extend webpackDevServer configuration
    karma: {},                      // Extend karma configuration
};
