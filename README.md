# Vusion CLI

CLI for developing Vusion Projects.

[![NPM Version][npm-img]][npm-url]
[![Dependencies][david-img]][david-url]
[![NPM Download][download-img]][download-url]

[npm-img]: http://img.shields.io/npm/v/vusion-cli.svg?style=flat-square
[npm-url]: http://npmjs.org/package/vusion-cli
[david-img]: http://img.shields.io/david/vusion/vusion-cli.svg?style=flat-square
[david-url]: https://david-dm.org/vusion/vusion-cli
[download-img]: https://img.shields.io/npm/dm/vusion-cli.svg?style=flat-square
[download-url]: https://npmjs.org/package/vusion-cli

## Project Types

- `library`
- `webapp`

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
    assetsPath: '',                 // Assets path will be copied to dest path
    extractCSS: false,              // Extract CSS by ExtractTextPlugin in build mode
    webpack: {...},                 // Extend webpack configuration
    webpackDevServer: {...},        // Extend webpackDevServer configuration
}
```
