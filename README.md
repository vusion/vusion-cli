# Vusion CLI

CLI for developing Vusion Projects.

[![CircleCI][circleci-img]][circleci-url]
[![NPM Version][npm-img]][npm-url]
[![Dependencies][david-img]][david-url]
[![NPM Download][download-img]][download-url]

[npm-img]: http://img.shields.io/npm/v/vusion-cli.svg?style=flat-square
[npm-url]: http://npmjs.org/package/vusion-cli
[david-img]: http://img.shields.io/david/vusion/vusion-cli.svg?style=flat-square
[david-url]: https://david-dm.org/vusion/vusion-cli
[download-img]: https://img.shields.io/npm/dm/vusion-cli.svg?style=flat-square
[download-url]: https://npmjs.org/package/vusion-cli
[circleci-img]: https://img.shields.io/circleci/project/github/vusion/vusion-cli.svg?style=flat-square
[circleci-url]: https://circleci.com/gh/vusion/vusion-cli

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
