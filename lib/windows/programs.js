/**
 * Windows 8 WinMD File Finder
 */
var path = require('path'),
	log = require('../log'),
	exec = require('child_process').exec,
	finder = require('./finder');

const MAX_BUFFER_SIZE = Number.MAX_VALUE;

/*
 Public API.
 */
exports.ildasm = ildasm;
exports.certutil = curryFindAndExec('certutil.exe');
exports.clang = curryFindAndExec('clang.exe', 'Please install the latest Windows snapshot from www.llvm.org/builds.');
exports.dism = curryFindAndExec('dism.exe');
exports.explorer = curryFindAndExec('explorer.exe');
exports.makecert = curryFindAndExec('makecert.exe');
exports.msbuild = curryFindAndExec('msbuild.exe');
exports.powershell = curryFindAndExec('powershell.exe', null, function(c){return '$(' + c + ')';});
exports.pvk2pfx = curryFindAndExec('pvk2pfx.exe');
exports.signtool = curryFindAndExec('signtool.exe');

/*
 Implementation.
 */
function ildasm(ref, to, done) {
	var ildasmRef = finder.find('ildasm.exe');

	if (!ildasmRef) {
		return done('Could not find ildasm.exe. Please make sure you have a supported version of .NET installed.');
	}
	// Note: simplify specifying the full path to /out= doesn't seem to work. It just outputs to the local dir.
	var output = exec('cd %temp% && "' + ildasmRef + '" /out="' + to + '" "' + ref + '"', { maxBuffer: MAX_BUFFER_SIZE }, disassembled);
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

function curryFindAndExec(program, notFoundMessage, transform) {
	if (!notFoundMessage) {
		notFoundMessage = 'Please make sure you have a supported version of .NET installed.';
	}
	return function(args, done, options) {
		if (!options) {
			options = {};
		}
		var ref = finder.find(program, options.sdk);
		if (!ref) {
			return done('Could not find ' + program + '. ' + notFoundMessage);
		}
		if (transform) { args = transform(args); }
		var command = '"' + ref + '" ' + args,
			output = exec(command, { maxBuffer: MAX_BUFFER_SIZE }, callback);
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
