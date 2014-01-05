/* jshint node: true */

'use strict';

var filesize = require('filesize'),
    gutil = require('gulp-util'),
    path = require('path'),
    map = require('map-stream');

var bytediff = function() {
    return map(function(file, cb) {
        // Persist the original size of the file for later
        file.bytediff = Buffer.byteLength(String(file.contents));
        cb(null, file);
    });
};

// Convenience method
bytediff.start = bytediff;

bytediff.stop = function() {
    return map(function(file, cb) {
        var finalsize = Buffer.byteLength(String(file.contents)),
            saving    = 0,
            didsave   = ' saved ',
            report    = '',
            newsize;

        if (finalsize > file.bytediff) {
            saving  = finalsize - file.bytediff;
            newsize = gutil.colors.yellow(filesize(finalsize));
            didsave = ' gained ';
        } else {
            saving  = file.bytediff - finalsize;
            newsize = gutil.colors.green(filesize(finalsize));
        }

        if (saving > 0) {
            report = ' (' + filesize(file.bytediff) + ' -> ' + newsize + ')';
        }
        gutil.log(path.basename(file.path) + didsave + filesize(saving) + report);
        cb(null, file);
    });
};

module.exports = bytediff;
