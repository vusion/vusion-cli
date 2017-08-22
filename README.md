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

## Commands

- `vusion help`: Show help of all commands

- `vusion init <project-type> <project-name>`: Initalize a vusion project
- `vusion dev`: Run develop server
- `vusion build`: Build a distribution
- `vusion publish`: Publish a directory to gh-pages

- `-p, --port <port>`: WebpackDevServer port in dev mode
- `--extract-css`: Extract CSS by ExtractTextPlugin in build mode
- `vusion -V, --version`: Show the version of current CLI

## Configuration

``` js
{
    type: '',                       // Vusion project type. Required option. 'library', 'app'
    assetsPath: '',                 // Path of assets, which will be copied into destination directory
    clean: true,                    // Clean the destination directory before `dev` or `build`
    libraryPath: '',                // Library entry path. To be `./index.js` by default if project type is `library`
    docs: false,                    // Generate docs of common components in library. Always be true if project type is `library`
    hot: true,                      // Enable/Disable hot reload in `dev` mode
    sourceMap: false,               // Generate sourceMap in `build` mode
    extractCSS: false,              // Extract CSS via ExtractTextPlugin in `build` mode
    uglifyJS: false,                // Compress JS via UglifyJSPlugin only in `build` mode
    experimental: false,            // Enable some experimental loaders or plugins, like ModuleConcatenationPlugin
    webpack: {},                    // Extend webpack configuration
    webpackDevServer: {},           // Extend webpackDevServer configuration
}
```

## Development

### Related Dependencies

- [vue-multifile-loader][vue-multifile-loader-url] ![vue-multifile-loader][vue-multifile-loader-img]
- [vusion-vue-loader][vusion-vue-loader-url] ![vusion-vue-loader][vusion-vue-loader-img]
- [vusion-css-loader][vusion-css-loader-url] ![vusion-css-loader][vusion-css-loader-img]
- [vusion-doc-loader][vusion-doc-loader-url] ![vusion-doc-loader][vusion-doc-loader-img]
- [icon-font-loader][icon-font-loader-url] ![icon-font-loader][icon-font-loader-img]

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
