/* eslint-disable no-multi-spaces */
module.exports = {
    type: '',                              // [Required] Vusion project type. 'library', 'app'
    staticPath: '',                        // Path of static files, which will be copied into destination directory
    assetsPath: '',                        // @deprecated, alias of option `staticPath`
    libraryPath: '',                       // [Required] Library entry path. To be `./src` by default if project type is `library`
    baseCSSPath: '',                       // Path of base CSS. If not set, it will be `library/base/base.css`
    globalCSSPath: '',                     // Path of global CSS. If not set, it will be `library/base/global.css`
    testPaths: {                           // Paths for karma test
        src: './src',
        unit: './test/unit',
    },
    clean: true,                           // Clean the destination directory before `dev` or `build`
    docs: false,                           // Generate docs of common components in library. Always be true if project type is `library`
    open: true,                            // Enable/Disable to open browser at the beginning in `dev` mode
    hot: true,                             // Enable/Disable to hot reload in `dev` mode
    sourceMap: false,                      // Generate sourceMap in `build` mode
    extractCSS: false,                     // Extract CSS via ExtractTextPlugin only in `build` mode
    uglifyJS: true,                        // Compress JS via UglifyJSPlugin only in `build` mode
    minifyJS: false,                       // Minify JS only in `build` mode. Set `true` or 'babel-minify' to use BabelMinifyPlugin, set 'uglify-js' to use UglifyJSPlugin as same as `uglifyJS: true`
    experimental: false,                   // Enable some experimental loaders or plugins, like ModuleConcatenationPlugin
    resolvePriority: 'cwd',                // Priority to resolve modules or loaders, "cwd"(default) or "cli"
    browsers: ['> 1%', 'last 2 versions', 'ie >= 9'],    // Browers Compatibility referred in autoprefixer. See browserslist for more details
    babelIncludes: [],                     // Reinclude some files excluded in node_modules
    webpack: {},                           // Extend webpack configuration
    webpackDevServer: {},                  // Extend webpackDevServer configuration
    postcss: [],                           // Extend postcss plugins
    vue: {},                               // Extend vue-loader options
    karma: {},                             // Extend karma configuration
};
