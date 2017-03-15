# gulp-stylesheet-index [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![bitHound Dependencies](https://www.bithound.io/github/burnedikt/gulp-stylesheet-index/badges/dependencies.svg)](https://www.bithound.io/github/burnedikt/gulp-stylesheet-index/master/dependencies/npm) [![Coverage percentage][coveralls-image]][coveralls-url]

> Input html file(s) and get a stream of all referenced stylesheets which can then be usedfor further processing like concatenation, minification or for testing

> _Clone code from_ [gulp-scripts-index](https://github.com/burnedikt/gulp-scripts-index)

## Install

```sh
$ npm install --save-dev gulp-stylesheet-index
```

## Usage

### Simple Example

If you simply need all files that are referenced in the index.html and you don't want to use the excellent [useref](https://github.com/jonkemp/gulp-useref) for further processing it is as simple as:

```js
var gsi = require('gulp-stylesheet-index');

gulp.src(['index.html'])
	.pipe(gsi())
	.pipe(doSomethingElse())
	.pipe(gulp.dest('./'))
```

## Options

- `searchPaths` {Array} - Defaults to `[]`. this option can be used to specify additional locations in which to look for the script files referenced in index.html. That way, even files that are not stored at the actually specified location can be found and processed. The specified searchpaths are to be defined as relative to the process's cwd.

## License

MIT © [Artem Kolesnik]()


[npm-image]: https://badge.fury.io/js/gulp-stylesheet-index.svg
[npm-url]: https://npmjs.org/package/gulp-stylesheet-index
[travis-image]: https://travis-ci.org/burnedikt/gulp-stylesheet-index.svg?branch=master
[travis-url]: https://travis-ci.org/burnedikt/gulp-stylesheet-index
[daviddm-image]: https://david-dm.org/burnedikt/gulp-stylesheet-index.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/burnedikt/gulp-stylesheet-index
[coveralls-image]: https://coveralls.io/repos/burnedikt/gulp-stylesheet-index/badge.svg?branch=master
[coveralls-url]: https://coveralls.io/r/burnedikt/gulp-stylesheet-index?branch=master
