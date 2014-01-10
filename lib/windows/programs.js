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
exports.makecert = makecert;
exports.pvk2pfx = pvk2pfx;

/*
 Implementation.
 */
function ildasm(ref, to, done) {
	finder.find('ildasm.exe', found);

	function found(ildasmRef) {
		if (!ildasmRef) {
			return done('Could not find ildasm.exe. Please make sure you have a supported version of .NET installed.');
		}
		// Note: simplify specifying the full path to /out= doesn't seem to work. It just outputs to the local dir.
		var output = exec('cd %temp% && "' + ildasmRef + '" /out="' + to + '" "' + ref + '"', disassembled);
		output.stdout.on('data', handle);
		output.stderr.on('data', handle);
	}

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

function makecert(args, done) {
	finder.find('makecert.exe', found);

	function found(ref) {
		if (!ref) {
			return done('Could not find makecert.exe. Please make sure you have a supported version of .NET installed.');
		}
		// Note: simplify specifying the full path to /out= doesn't seem to work. It just outputs to the local dir.
		var output = exec('"' + ref + '" ' + args, callback);
		output.stdout.on('data', handle);
		output.stderr.on('data', handle);
	}

	function callback(err) {
		log.trace(Array.prototype.slice.call(arguments, 0).join(' '));
		if (err) {
			done(err);
		}
		else {
			done();
		}
		args = done = null;
	}
}

function pvk2pfx(args, done) {
	finder.find('pvk2pfx.exe', found);

	function found(ref) {
		if (!ref) {
			return done('Could not find pvk2pfx.exe. Please make sure you have a supported version of .NET installed.');
		}
		// Note: simplify specifying the full path to /out= doesn't seem to work. It just outputs to the local dir.
		var output = exec('"' + ref + '" ' + args, callback);
		output.stdout.on('data', handle);
		output.stderr.on('data', handle);
	}

	function callback(err) {
		log.trace(Array.prototype.slice.call(arguments, 0).join(' '));
		if (err) {
			done(err);
		}
		else {
			done();
		}
		args = done = null;
	}
}

/*
 Utility.
 */
function handle() {
	log.debug.apply(log, arguments);
}
