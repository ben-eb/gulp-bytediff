/* jshint node: true */
/* global describe, it, before, beforeEach, after, afterEach */

'use strict';

var bytediff = require('./index'),
    expect   = require('chai').expect,
    gutil    = require('gulp-util'),
    gulp     = require('gulp'),
    es       = require('event-stream');

describe('gulp-bytediff', function() {
    it('should store the original size on the file object', function(cb) {
        gulp.src('./index.js')
            .pipe(bytediff())
            .pipe(es.map(function(file) {
                expect(file.bytediff).to.be.a('number');
                cb();
            }));
    });
    it('should be able to report the new size of a file', function(cb) {
        var output = '';
        process.stdout.write = (function(write) {
            return function(string, encoding, fd) {
                output = string;
                write.apply(process.stdout, arguments);
            };
        })(process.stdout.write);
        gulp.src('./index.js')
            .pipe(bytediff())
            .pipe(es.map(function(file, done) {
                file.contents = new Buffer('minification happened');
                done(null, file);
            }))
            .pipe(bytediff.stop())
            .pipe(es.map(function(file) {
                expect(output).to.have.string('21 B');
                cb();
            }));
    });
});
