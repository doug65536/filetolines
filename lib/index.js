var fs = require('fs');

function readBlock(fd, buffer, carry, callback) {
    fs.read(fd, buffer, 0, buffer.length, null, function(err, bytes, buffer) {
        if (err) {
            // Error
            fs.close(fd, function() {
                callback(err);
            });
            return;
        }
        if (bytes == 0) {
            // End of file
            if (carry.length > 0) {
                if (callback(null, carry) === false) {
                    fs.close(fd);
                    return;
                }
            }
            fs.close(fd, function(err) {
                callback(err, null);
            });
            return;
        }

        var i, lineStart = 0, line;
        for (i = 0; i <= bytes; ++i) {
            if (i == bytes || buffer[i] == 10) {
                // Get as much of the line as we have in the buffer
                line = buffer.toString('ascii', lineStart, i);
                lineStart = i + 1;

                if (i == bytes) {
                    // We are at the end of the buffer, carry
                    if (carry.length == 0) {
                        readBlock(fd, buffer, line, callback);
                    } else {
                        carry += line;
                        line = undefined;
                        readBlock(fd, buffer, carry, callback);
                    }
                } else if (carry.length == 0) {
                    if (callback(null, line) === false) {
                        fs.close(fd);
                        return;
                    }
                    line = undefined;
                } else {
                    carry += line;
                    line = undefined;
                    if (callback(null, carry) === false) {
                        fs.close(fd);
                        return;
                    }
                    carry = '';
                }
            }
        }
    });
}

function fileToLines(path, options, callback) {
    if (typeof options === 'function') {
        callback = options;
        options = {};
    }
    if (!options.blockSize)
        options.blockSize = 8192;

    var file = fs.open(path, 'r', function(err, fd) {
        if (err) {
            callback(err);
            return;
        }

        var buffer = new Buffer(options.blockSize);
        readBlock(fd, buffer, '', callback);
    });
}

module.exports = fileToLines;
