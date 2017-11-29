/* eslint-disable no-multi-spaces */
module.exports = {
    type: '',                              // Vusion project type. Required option. 'library', 'app'
    staticPath: '',                        // Path of assets, which will be copied into destination directory
    assetsPath: '',                        // @deprecated, alias of option `staticPath`
    libraryPath: '',                       // Library entry path. To be `./index.js` by default if project type is `library`
    baseCSSPath: './src/base/index.css',   // Path of base CSS
    globalCSSPath: './global.css',         // Path of global CSS
    clean: true,                           // Clean the destination directory before `dev` or `build`
    docs: false,                           // Generate docs of common components in library. Always be true if project type is `library`
    open: true,                            // Enable/Disable to open browser at the beginning in `dev` mode
    hot: true,                             // Enable/Disable to hot reload in `dev` mode
    sourceMap: false,                      // Generate sourceMap in `build` mode
    extractCSS: false,                     // Extract CSS via ExtractTextPlugin in `build` mode
    uglifyJS: false,                       // Compress JS via UglifyJSPlugin only in `build` mode
    experimental: false,                   // Enable some experimental loaders or plugins, like ModuleConcatenationPlugin
    resolvePriority: 'cwd',                // Priority to resolve modules or loaders, "cwd"(default) or "cli"
    webpack: {},                           // Extend webpack configuration
    webpackDevServer: {},                  // Extend webpackDevServer configuration
    postcss: [],                           // Extend postcss plugins
    vue: {},                               // Extend vue-loader options
    karma: {},                             // Extend karma configuration
};
