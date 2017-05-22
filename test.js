/* global describe, it */

'use strict';

var bytediff = require('./index'),
    expect   = require('chai').expect,
    gulp     = require('gulp'),
    gutil    = require('gulp-util'),
    map      = require('map-stream');

function fixture (contents) {
    return new gutil.File({
        contents: contents,
        cwd: __dirname,
        base: __dirname,
        path: __dirname + '/fixture.css'
    });
}

describe('gulp-bytediff', function () {
    it('should be able to report the new size of a file', function(cb) {
        var output = '';
        process.stdout.write = (function(write) {
            return function(string) {
                output = string;
                write.apply(process.stdout, arguments);
            };
        })(process.stdout.write);
        gulp.src('./index.js')
            .pipe(bytediff())
            .pipe(map(function(file, done) {
                file.contents = new Buffer('minification happened');
                done(null, file);
            }))
            .pipe(bytediff.stop())
            .pipe(map(function() {
                expect(output).to.have.string('21 B');
                cb();
            }));
    });
    it('should trigger custom callback, and only custom callback', function(cb) {
        var output = '';
        process.stdout.write = (function(write) {
            return function(string) {
                output = string;
                write.apply(process.stdout, arguments);
            };
        })(process.stdout.write);
        gulp.src('./index.js')
            .pipe(bytediff())
            .pipe(map(function(file, done) {
                file.contents = new Buffer('minification happened');
                done(null, file);
            }))
            .pipe(bytediff.stop(function () {
              console.log('testing123');
            }))
            .pipe(map(function() {
                expect(output).to.have.string('testing123');
                expect(output).not.to.have.string('index');
                cb();
            }));
    });
    it('should be able to report the new size of several files at once', function(cb) {
        var output = '';
        process.stdout.write = (function(write) {
            return function(string) {
                output += string;
                write.apply(process.stdout, arguments);
            };
        })(process.stdout.write);
        gulp.src(['./index.js', './package.json', './README.md'])
            .pipe(bytediff())
            .pipe(map(function(file, done) {
                file.contents = new Buffer('minification happened');
                done(null, file);
            }))
            .pipe(bytediff.stop(function(){}))
            .on('end', function(file) {
                bytediff.report(file);
                expect(output).to.have.string('index');
                expect(output).to.have.string('package');
                expect(output).to.have.string('README');
                cb();
            });
    });
    it('should store the original size on the file object', function (cb) {
        var stream = bytediff();

        stream.on('data', function (data) {
            expect(data.bytediff.startSize).to.eql(5);
            cb();
        });

        stream.write(fixture(new Buffer('hello')));
    });
    it('should pass null contents through', function (cb) {
        var stream = bytediff();

        stream.on('data', function (data) {
            expect(data.contents).to.eql(null);
            cb();
        });

        stream.write(fixture(null));
    });
});
