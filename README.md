filetolines
===========

Node module to read a file line-by-line

Example:

    var fileToLines = require('filetolines');
    fileToLines('file.txt', { blockSize: 1024 }, function(err, line) {
        if (err === null) {
            if (line !== null) {
                console.log('Line:', line);
            } else {
                console.log('End of file');
            }
        } else {
            console.log('error:', err);
        }
    });

The file is read efficiently using a Buffer object. The operation is asynchronous, fileToLines returns immediately.

Each line is extracted and the callback is called with a string for each line. When the end of file is successfully reached, the callback is called with the string parameter set to `null`.

The callbacks you get should be equivalent to one call per array entry you would get from string `.split('\n');`

If an error occurs, the first parameter to the callback will be set to an error object and there will be no further callbacks.

The callback can abort the parsing operation by returning `false`. Any other return value (or no return value) is ignored.

The character encoding is currently limited to ASCII.

The file does not need to end with a linefeed. If the file does end with a linefeed, the last callback will be an empty string, to represent
the empty line after the linefeed (corresponding with the `.split` behavior mentioned above).
If the last line does not end with a linefeed, the last string is the content of the last line.
