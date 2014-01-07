var nodeunit = require('nodeunit'),
    reporter = nodeunit.reporters.default;
process.chdir(__dirname + '/..');

var testModule = require(__dirname + '/../test');

function CustomRunner() {
    this.failures = 0;
}
CustomRunner.prototype = {
    log: function(assertion) {
        if (assertion.failed()) {
            ++this.failures;
            console.log('assertion failed!', assertion.message);
        }
    }
};

function BlockSizeGenerator() {
    var minBuffer = 16,
        maxBuffer = 20480,
        step = 1,
        buffer = minBuffer;

    return function() {
        var result = buffer;
        buffer += step++;
        if (result <= maxBuffer)
            return result;
        return undefined;
    }
}

function pad(n, d, w) {
    return ('                    ' + n.toFixed(d)).substr(-w);
}

function showElapsed(prefix, st, en) {
    var el = en - st;
    if (el >= 60000) {
        console.log(prefix, pad(el / 60000, 3, 7), 'minutes');
    } else {
        console.log(prefix, pad(el / 1000, 3, 7), 'seconds');
    }
}

function tests(runner, gen) {
    var size = gen(), st, en;
    if (size !== undefined) {
        st = new Date();
        nodeunit.runTest('testBlockSizes', testModule.testBlockSizes.bind(undefined, size),
                runner, function(assertions) {
            en = new Date();
            showElapsed('buffer size ' + pad(size, 0, 7), st, en);
            if (assertions) {
                var anyErrors = assertions.some(function(assertion) {
                    return assertion.failed();
                });
            }
            if (runner.failures > 0)
                process.exit(1);

            tests(runner, gen);
        });
    }
}
var runner = new CustomRunner();
tests(runner, BlockSizeGenerator());

//reporter.run(['test']);
