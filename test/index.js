"use strict";
var fs = require('fs'),
    fileToLines = require('../lib'),
    test = require('nodeunit');

function testBlockSize(test, path, lines, size, maxSize) {
    console.log('testing buffer size', size);
    var lineNumber = 0;
    fileToLines(path, { blockSize: size }, function(err, line) {
        test.ifError(err);

        if (lineNumber < lines.length) {
            test.strictEqual(line, lines[lineNumber++]);
        } else {
            test.strictEqual(line, null);
        }

        if (line === null) {
            if (size < maxSize)
                testBlockSize(test, path, lines, size + 1, maxSize);
            else {
                test.done();
            }
        }
    });
}

exports.testEmptyFile = function(test) {
    var path = 'test/empty.txt',
        lines = [],
        minBuffer = 4096,
        maxBuffer = 4096;
    test.expect(6 * (lines.length + 1));
    testBlockSize(test, path, lines, minBuffer, maxBuffer);
};

exports.testBlockSizes = function(test) {
    var path = 'test/biglog.log',
        lines = fs.readFileSync(path).toString().split('\n'),
        minBuffer = 222,
        maxBuffer = 4096;
    test.expect(6 * (lines.length + 1));
    testBlockSize(test, path, lines, minBuffer, maxBuffer);
};
