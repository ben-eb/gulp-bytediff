/* jshint node: true */

'use strict';

var size  = require('filesize'),
    gutil = require('gulp-util'),
    path  = require('path'),
    map   = require('map-stream');

function bytediff () {
    return map(function (file, cb) {
        // Persist the original size of the file for later
        file.bytediff = {
            startSize: file.contents.length
        };
        cb(null, file);
    });
}

// Convenience method
bytediff.start = bytediff;

bytediff.stop = function (formatFn) {
    return map(function (file, cb) {
        if (typeof formatFn !== 'function') {
            formatFn = function (data) {
                var saved = (data.savings > 0) ? ' saved ' : ' gained ';
                var color = (data.savings > 0) ? 'green' : 'yellow';
                var start = size(data.startSize);
                var end = gutil.colors[color](size(data.endSize));
                var report = ' (' + start + ' -> ' + end + ')';
                return data.fileName + saved +
                  size(Math.abs(data.savings)) + report;
            };
        }

        var endSize = file.contents.length;

        gutil.log(formatFn({
            fileName: path.basename(file.path),
            startSize: file.bytediff.startSize,
            endSize: endSize,
            savings: file.bytediff.startSize - endSize,
            percent: (endSize / file.bytediff.startSize)
        }));

        cb(null, file);
    });
};

module.exports = bytediff;
