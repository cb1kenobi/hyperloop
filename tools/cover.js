var exec = require('child_process').exec,
	path = require('path');

var BIN = path.join('.', 'node_modules', '.bin') + path.sep,
	specs = [
		'specs/java/metabase.js',
		'specs/compiler.js',
		'specs/ios/metabase.js',
		'specs/ios/ios.js',
		'specs/windows/winmd.js'
	];

exec(BIN + 'istanbul cover --report html ' + BIN + '_mocha -- -r should -R min ' + specs.join(' '),
	function(err, stdout, stderr) {
		if (err) { console.error(err); process.exit(1); }
    console.log('test coverage report generated to "coverage"');
	}
);