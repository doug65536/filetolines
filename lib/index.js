"use strict";

var fs = require('fs');

function FileToLinesContext() {
    this.fd = undefined;
    this.buffer = undefined;
    this.carry = '';
    this.callback = undefined;
    this.readBlockHandler = this.readBlockCallback.bind(this);
}
FileToLinesContext.prototype = {
    start: function(path, options, callback) {
        if (typeof options === 'function') {
            callback = options;
            options = {};
        }
        // performance analysis shows that sizes beyond 1024 do not help
        if (!options.blockSize)
            options.blockSize = 1024;

        this.callback = callback;

        fs.open(path, 'r', function(err, fd) {
            if (err) {
                callback(err);
                return;
            }

            this.fd = fd;
            this.buffer = new Buffer(options.blockSize);
            this.readBlock();
        }.bind(this));
    },
    readBlock: function() {
        fs.read(this.fd, this.buffer, 0, this.buffer.length, null, this.readBlockHandler);
    },
    readBlockCallback: function(err, bytes) {
        if (err) {
            // Error
            fs.close(fd, function() {
                this.callback(err);
            }.bind(this));
            return;
        }
        if (bytes == 0) {
            // End of file
            //if (this.carry.length > 0) {
                if (this.callback(null, this.carry) === false) {
                    fs.close(this.fd);
                    return;
                }
            //}
            fs.close(this.fd, function(err) {
                this.callback(err, null);
            }.bind(this));
            return;
        }

        var i, lineStart = 0, line;
        for (i = 0; i <= bytes; ++i) {
            if (i == bytes || this.buffer[i] == 10) {
                // Get as much of the line as we have in the buffer
                line = this.buffer.toString('ascii', lineStart, i);
                lineStart = i + 1;

                if (i == bytes) {
                    // We are at the end of the buffer, carry
                    if (this.carry.length == 0) {
                        this.carry = line;
                        this.readBlock();
                    } else {
                        this.carry += line;
                        line = undefined;
                        this.readBlock();
                    }
                } else if (this.carry.length == 0) {
                    if (this.callback(null, line) === false) {
                        fs.close(this.fd);
                        return;
                    }
                    line = undefined;
                } else {
                    this.carry += line;
                    line = undefined;
                    if (this.callback(null, this.carry) === false) {
                        fs.close(this.fd);
                        return;
                    }
                    this.carry = '';
                }
            }
        }
    }
}

function fileToLines(path, options, callback) {
    var context = new FileToLinesContext();
    context.start(path, options, callback);
}

module.exports = fileToLines;
