'use strict';

var size  = require('filesize'),
    gutil = require('gulp-util'),
    path  = require('path'),
    map   = require('map-stream');

var reportFiles = [];

function bytediff () {
    return map(function (file, cb) {
        // Persist the original size of the file for later
        file.bytediff = {
            startSize: file.contents ? file.contents.length : null
        };

        cb(null, file);
    });
}

// Convenience method
bytediff.start = bytediff;

var fileFormatFn = function (data) {
    var saved = (data.savings > 0) ? ' saved ' : ' gained ';
    var color = (data.savings > 0) ? 'green' : 'yellow';
    var start = size(data.startSize);
    var end = gutil.colors[color](size(data.endSize));
    var report = ' (' + start + ' -> ' + end + ')';
    gutil.log(data.fileName + saved +
        size(Math.abs(data.savings)) + report);
};

bytediff.stop = function (formatFn) {
    return map(function (file, cb) {
        if (typeof formatFn !== 'function') {
            formatFn = fileFormatFn;
        }

        if (file.bytediff.startSize) {
            var endSize = file.contents.length;
            var results = {
                fileName: path.basename(file.path),
                startSize: file.bytediff.startSize,
                endSize: endSize,
                savings: file.bytediff.startSize - endSize,
                percent: ((endSize / file.bytediff.startSize) * 100).toFixed(1),
            };

            reportFiles.push(results);
            formatFn(results);
        }

        cb(null, file);
    });
};

bytediff.report = function (formatFn) {
    if (typeof formatFn !== 'function') {
        formatFn = fileFormatFn;
    }

    if (reportFiles.length > 0) {
        reportFiles.forEach(function (result) {
            formatFn(result);
        });
    }
};

module.exports = bytediff;
