/* eslint-disable no-multi-spaces */
module.exports = {
    type: '',                       // Vusion project type. Required option. 'library', 'app'
    assetsPath: '',                 // Path of assets, which will be copied into destination directory
    clean: true,                    // Clean the destination directory before `dev` or `build`
    docs: false,                    // Generate docs of common components. Always be true if project type is `library`
    hot: true,                      // Enable/Disable hot reload in `dev` mode
    sourceMap: false,               // Generate sourceMap in `build` mode
    extractCSS: false,              // Extract CSS via ExtractTextPlugin in `build` mode
    uglifyJS: false,                // Compress JS via UglifyJSPlugin only in `build` mode
    experimental: false,            // Enable some experimental loaders or plugins, like ModuleConcatenationPlugin
    webpack: {},                    // Extend webpack configuration
    webpackDevServer: {},           // Extend webpackDevServer configuration
};