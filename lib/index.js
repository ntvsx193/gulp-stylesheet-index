'use strict';

const PLUGIN_NAME = require('../package.json').name;

//////////////////
// Dependencies //
//////////////////
// Streams!
const through = require('through2');
// HTML Parser
const htmlparser = require('htmlparser2');
// object merger (for options)
const merge = require('merge');
// vinyl file system
const vfs = require('vinyl-fs');
// gulp helpers
const gutil = require('gulp-util');
// array helper (lodash)
const array = require('lodash/array');
// path manipulation
const path = require('path');

module.exports = function (options) {
  // default config
  const defaults = {
    IE: false,
    searchPaths: []
  };
  // init variables to store all stylesheets
  const stylesheets = [];
  // const conditionalComentRegex = /<link\s+.*rel="stylesheet"\s+.*href="(.*)".*\/*>/gi;
  // merge passed options with defaults
  options = merge(defaults, options);

  const outputStream = through.obj(function (file, enc, callback) {
    /**
     * adds a script src to the output buffer
     * @param {String} src the script src
     */
    const _addStylesheet = function (src) {
      // add the script src to the array of stylesheets
      stylesheets.push(src);
    };

    // if there is no file, just skip
    if (file.isNull()) {
      return callback(null, file);
    }
    // create a new html parser and feed the stream / buffer into it to get out all stylesheets
    const parser = new htmlparser.Parser({
      // oncomment: (comment) => {
      //   // if the IE options is set to true, we need to also identify stylesheets that only apply for IE
      //   // we can do so by looking at the conditional comments for IE and extracting the stylesheets in them
      //   // apply the regex to the comment to determine if we are looking at an IE conditional comment
      //   let regResult;
      //   // if we have one match, there might be others, so exec as often as possible
      //   while (options.IE && (regResult = conditionalComentRegex.exec(comment))) {
      //     // add the ie-specific script to the list of stylesheets
      //     _addStylesheet(regResult[1]);
      //   }
      // },
      onopentag: (name, attrs) => {
        // if we found a script (referenced via src attribute) add it to the list of stylesheets
        if (name === 'link' && attrs.rel === 'stylesheet' && attrs.href){
          _addStylesheet(attrs.href);
        }
      },
      onend: () => {
        // as soon as everything has been parsed, add the found files to the stream
        // look for stylesheets in all available search paths. Available search paths are:
        // - The file.base folder (i.e. the folder in which the index.html resides)
        // - any other specified folders (options.searchPaths)
        const searchPaths = array.union([path.relative(process.cwd(), file.base)], options.searchPaths);
        // create a glob for all available search paths
        let searchPathsGlob;
        if (searchPaths.length > 1) {
          searchPathsGlob = `{${array.join(searchPaths, ',')}}`;
        } else {
          searchPathsGlob = searchPaths.pop();
        }
        const scriptsGlob = stylesheets.map((scriptPath) => {
          return path.join(searchPathsGlob, scriptPath);
        });
        // use the created glob to search for the files
        vfs.src(scriptsGlob, {
          cwd: process.cwd(),
          cwdbase: true,
          allowEmpty: true,
          // we want to keep the order as specified in the index.html
          nosort: true,
          // do not match directories, just files, since we want to pipe those
          nodir: true
        })
        // whenever the data event is ready, we will get a file (which can be pushed to the result stream)
        .on('data', (file) => {
          this.push(file);
        })
        // when an error occurs, make sure to pass it on to the promises
        .on('error', (error) => {
          this.emit('error', new gutil.PluginError(PLUGIN_NAME, error));
          callback(error);
        })
        // as soon as the file has been retrieved via the data event, the stream can be closed and our promise resolved
        .on('finish', () => {
          this.emit('end');
          // we're done with this file. Let's go to the next
          callback();
        });
      }
    }, {decodeEntities: true});
    // otherwise we have a buffer or a stream, let's start with streams
    if (file.isStream()) {
      // feed the file content stream into the html parser, so we can get all stylesheets
      file.contents.pipe(parser);
    }
    // last and most simple case: Buffer
    if (file.isBuffer()) {
      // feed the contents of the buffer into the html parser, the rest is equal to the stream functionality
      parser.write(file.contents.toString());
      // after we fed everything into the parser, notify it that we're done
      parser.done();
    }
  });

  return outputStream;
};
