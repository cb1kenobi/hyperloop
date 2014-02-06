var path = require('path'),
	fs = require('fs'),
	child_process = require('child_process');

var CMD = '"' + path.join(process.cwd(), 'bin', 'hyperloop') + '" --no-colors',
	VERSION = require('../../package').version;

describe('`hyperloop`', function() {
	var exec = process.platform === 'win32'
		? execWindowsWorkaround
		: child_process.exec;

	it('executes without error', function(done) {
		exec(CMD, function(err, stdout, stderr) {
			if (err) { throw err; }
			done();
		});
	});

	['', '--help', 'help'].forEach(function(args) {
		var suffix = args ? '"' + args + '"' : 'no arguments';
		it('shows help when executed with ' + suffix, function(done) {
			exec(CMD + ' ' + args, function(err, stdout, stderr) {
				if (err) { throw err; }
				stdout.should.match(/Usage:\s+hyperloop/);
				done();
			});
		});
	});

});

/**
 * On Windows, there's a bug in NodeJS where standard out only returns the first written line. Or, it's possible we're
 * doing something weird in hyperloop. To work around this issue, pipe the output of our exec in to a temporary file,
 * then invoke our callback with contents of that file substituted for standard in.
 * @param command The command to execute, such as
 * @param callback
 */
function execWindowsWorkaround(command, callback) {
	var exec = child_process.exec,
		temp = path.join((process.env.TMPDIR || process.env.TEMP || '/tmp'), 'hyperloop_windows_write.out');
	exec(command + ' > ' + temp, function(err, stdout, stderr) {
		callback(err, fs.readFileSync(temp, 'utf8'), stderr);
		command = callback = exec = temp = null;
	});
}
