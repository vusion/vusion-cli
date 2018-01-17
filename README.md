# Vusion CLI

CLI for developing Vusion Projects.

[![CircleCI][circleci-img]][circleci-url]
[![NPM Version][npm-img]][npm-url]
[![Dependencies][david-img]][david-url]
[![NPM Download][download-img]][download-url]

[circleci-img]: https://img.shields.io/circleci/project/github/vusion/vusion-cli.svg?style=flat-square
[circleci-url]: https://circleci.com/gh/vusion/vusion-cli
[npm-img]: http://img.shields.io/npm/v/vusion-cli.svg?style=flat-square
[npm-url]: http://npmjs.org/package/vusion-cli
[david-img]: http://img.shields.io/david/vusion/vusion-cli.svg?style=flat-square
[david-url]: https://david-dm.org/vusion/vusion-cli
[download-img]: https://img.shields.io/npm/dm/vusion-cli.svg?style=flat-square
[download-url]: https://npmjs.org/package/vusion-cli

## Project Types

- `library`
- `app`

## Install

``` shell
npm install -g vusion-cli
```

## Quick Start

``` shell
vusion init app my-app
npm install
vusion dev
```

## Commands

- `vusion help`: Show help of all commands
- `vusion -V, --version`: Show the version of current CLI

- `vusion init <project-type> <project-name>`: Initalize a vusion project
- `vusion dev`: Run develop server
    - `-c, --config-path <path>`: Vusion config path
    - `-e, --entry-path <path>`: Change default entry path
    - `-C, --no-clean`: Disable to clean and copy
    - `-l, --library-path <path>`: Library entry path. To be `./index.js` by default if project type is `library`
    - `-d, --docs`: Generate docs of common components in library. Always be true if project type is `library`
    - `-p, --port <port>`: Web Server Port
    - `-O, --no-open`: Disable to open browser at the beginning
    - `-H, --no-hot`: Disable to hot reload
    - `--resolve-priority`: Priority to resolve modules or loaders, "cwd"(default) or "cli"
- `vusion build`: Build a distribution
    - `-c, --config-path <path>`: Vusion config path
    - `-e, --entry-path <path>`: Change default entry path
    - `-C, --no-clean`: Disable to clean and copy
    - `-l, --library-path <path>`: Library entry path. To be `./index.js` by default if project type is `library`
    - `-d, --docs`: Generate docs of common components in library. Always be true if project type is `library`
    - `-s, --source-map`: Generate source map in build mode
    - `--extract-css`: Extract CSS by ExtractTextPlugin in build mode
    - `--uglify-js`: Compress and mangle JS by UglifyJSPlugin in build mode
    - `--minify-js`: Minify JS only in `build` mode. Set `true` or `'babel-minify'` to use BabelMinifyPlugin, set `'uglify-js'` to use UglifyJSPlugin as same as `--uglify`
    - `--experimental`: Enable some experimental loaders or plugins
    - `--resolve-priority`: Priority to resolve modules or loaders, "cwd"(default) or "cli"
- `vusion test`: Run karma test
    - `-c, --config-path <path>`: Vusion config path
    - `-p, --port <port>`: Web Server Port
    - `-w, --watch`: Karma watch
    - `--resolve-priority`: Priority to resolve modules or loaders, "cwd"(default) or "cli"
- `vusion publish <version>`: Publish a new version
- `vusion ghpages`: Push output directory to gh-pages
    - `-c, --config-path <path>`: Vusion config path
    - `-p, --path <path>`: Path to publish. Default is webpack output path
- `vusion dep`: List dependencies of vusion-cli

- `vusion transform <vue-path>`: Transform Vue component between singlefile and multifile pattern

## Configuration

Default `vusion.config.js` file:

``` js
{
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
    webpack: {},                           // Extend webpack configuration
    webpackDevServer: {},                  // Extend webpackDevServer configuration
    babelIncludes: [],                     // Reinclude some files excluded in node_modules
    postcss: [],                           // Extend postcss plugins
    vue: {},                               // Extend vue-loader options
    karma: {},                             // Extend karma configuration
};
```

## Development

### Related Dependencies

- [vue-multifile-loader][vue-multifile-loader-url] ![vue-multifile-loader][vue-multifile-loader-img]
- [vusion-vue-loader][vusion-vue-loader-url] ![vusion-vue-loader][vusion-vue-loader-img]
- [vusion-css-loader][vusion-css-loader-url] ![vusion-css-loader][vusion-css-loader-img]
- [vusion-doc-loader][vusion-doc-loader-url] ![vusion-doc-loader][vusion-doc-loader-img]
- [icon-font-loader][icon-font-loader-url] ![icon-font-loader][icon-font-loader-img]
- [css-sprite-loader][css-sprite-loader-url] ![css-sprite-loader][css-sprite-loader-img]
- [svg-classic-sprite-loader][svg-classic-sprite-loader-url] ![svg-classic-sprite-loader][svg-classic-sprite-loader-img]

[vue-multifile-loader-img]: http://img.shields.io/npm/v/vue-multifile-loader.svg?style=flat-square
[vue-multifile-loader-url]: http://npmjs.org/package/vue-multifile-loader
[vusion-vue-loader-img]: http://img.shields.io/npm/v/vusion-vue-loader.svg?style=flat-square
[vusion-vue-loader-url]: http://npmjs.org/package/vusion-vue-loader
[vusion-css-loader-img]: http://img.shields.io/npm/v/vusion-css-loader.svg?style=flat-square
[vusion-css-loader-url]: http://npmjs.org/package/vusion-css-loader
[vusion-doc-loader-img]: http://img.shields.io/npm/v/vusion-doc-loader.svg?style=flat-square
[vusion-doc-loader-url]: http://npmjs.org/package/vusion-doc-loader
[icon-font-loader-img]: http://img.shields.io/npm/v/icon-font-loader.svg?style=flat-square
[icon-font-loader-url]: http://npmjs.org/package/icon-font-loader
[css-sprite-loader-img]: http://img.shields.io/npm/v/css-sprite-loader.svg?style=flat-square
[css-sprite-loader-url]: http://npmjs.org/package/css-sprite-loader
[svg-classic-sprite-loader-img]: http://img.shields.io/npm/v/svg-classic-sprite-loader.svg?style=flat-square
[svg-classic-sprite-loader-url]: http://npmjs.org/package/svg-classic-sprite-loader
