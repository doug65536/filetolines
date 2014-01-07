"use strict";
var fs = require('fs'),
    fileToLines = require('../lib'),
    test = require('nodeunit');

function testBlockSize(test, name, path, lines, size) {
    var lineNumber = 0;
    fileToLines(path, { blockSize: size }, function(err, line) {
        test.ifError(err);

        if (err) {
            return;
        }

        if (lineNumber < lines.length)
            test.strictEqual(line, lines[lineNumber++]);
        else {
            test.strictEqual(line, null);
        }

        if (line === null) {
            test.done();
         }
    });
}

exports.testEmptyFile = function(test) {
    var path = 'test/0lines.txt',
        lines = [''],
        minBuffer = 4096,
        maxBuffer = 4096;
    // Expect one callback with an empty string, and one callback with null
    // Each callback asserts no error and equality to expectation
    test.expect(4);
    testBlockSize(test, 'testEmptyFile', path, lines, 1024);
};

exports.testBlockSizes = function(size, test) {
    var path = 'test/biglog.log',
        lines = fs.readFileSync(path).toString().split('\n');
    // Expect ifError and strictEqual per line, plus one for the null EOF callback
    test.expect(2 * (lines.length + 1));
    testBlockSize(test, 'testBlockSizes', path, lines, size);
};
