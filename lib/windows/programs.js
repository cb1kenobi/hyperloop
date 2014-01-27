/**
 * Windows 8 WinMD File Finder
 */
var path = require('path'),
	log = require('../log'),
	exec = require('child_process').exec,
	finder = require('./finder');

/*
 Public API.
 */
exports.ildasm = ildasm;
exports.makecert = curryFindAndExec('makecert.exe');
exports.pvk2pfx = curryFindAndExec('pvk2pfx.exe');
exports.clang = curryFindAndExec('clang.exe', 'Please install the latest Windows snapshot from www.llvm.org/builds.');

/*
 Implementation.
 */
function ildasm(ref, to, done) {
	var ildasmRef = finder.find('ildasm.exe');

	if (!ildasmRef) {
		return done('Could not find ildasm.exe. Please make sure you have a supported version of .NET installed.');
	}
	// Note: simplify specifying the full path to /out= doesn't seem to work. It just outputs to the local dir.
	var output = exec('cd %temp% && "' + ildasmRef + '" /out="' + to + '" "' + ref + '"', disassembled);
	output.stdout.on('data', handle);
	output.stderr.on('data', handle);

	function disassembled(err) {
		log.trace(Array.prototype.slice.call(arguments, 0).join(' '));
		if (err) {
			done(err);
		}
		else {
			done(undefined, path.resolve(process.env.temp + '/' + to));
		}
		ref = to = done = err = null;
	}
}

function curryFindAndExec(program, notFoundMessage) {
	if (!notFoundMessage) {
		notFoundMessage = 'Please make sure you have a supported version of .NET installed.';
	}
	return function(args, done) {
		var ref = finder.find(program);
		if (!ref) {
			return done('Could not find ' + program + '. ' + notFoundMessage);
		}
		var output = exec('"' + ref + '" ' + args, callback);
		output.stdout.on('data', handle);
		output.stderr.on('data', handle);

		function callback(err) {
			done(err ? err : undefined);
			args = done = null;
		}
	}
}

/*
 Utility.
 */
function handle() {
	log.debug.apply(log, arguments);
}
