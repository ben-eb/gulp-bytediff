/* jshint node: true */

'use strict';

var filesize = require('filesize'),
    gutil = require('gulp-util'),
    path = require('path'),
    es = require('event-stream');

var bytediff = function() {
    return es.map(function(file, cb) {
        // Persist the original size of the file for later
        file.bytediff = Buffer.byteLength(String(file.contents));
        cb(null, file);
    });
};

// Convenience method
bytediff.start = bytediff;

bytediff.stop = function() {
    return es.map(function(file, cb) {
        var finalsize = Buffer.byteLength(String(file.contents)),
            saving    = file.bytediff - finalsize,
            didsave   = ' saved ',
            report    = '',
            newsize;

        if (saving > 0) {
            if (finalsize > file.bytediff) {
                newsize = gutil.colors.yellow(filesize(finalsize));
                didsave = ' gained ';
            } else {
                newsize = gutil.colors.green(filesize(finalsize));
            }
            report = ' (' + filesize(file.bytediff) + ' -> ' + newsize + ')';
        }
        gutil.log(path.basename(file.path) + didsave + filesize(saving) + report);
        cb(null, file);
    });
};

module.exports = bytediff;
