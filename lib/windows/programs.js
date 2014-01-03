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
			throw 'Could not find ildasm.exe. Please make sure you have a supported version of .NET installed.';
		}
		// Note: simplify specifying the full path to /out= doesn't seem to work. It just outputs to the local dir.
		var output = exec('cd %temp% && "' + ildasmRef + '" /out="' + to + '" "' + ref + '"', disassembled);
		output.stdout.on('data', handle);
		output.stderr.on('data', handle);
	}

	function disassembled(err) {
		if (err) {
			throw err;
		}
		else {
			done(path.resolve(process.env.temp + '/' + to));
		}
		ref = to = done = err = null;
	}
}

function makecert(args, done) {
	finder.find('makecert.exe', found);

	function found(ref) {
		if (!ref) {
			throw 'Could not find makecert.exe. Please make sure you have a supported version of .NET installed.';
		}
		// Note: simplify specifying the full path to /out= doesn't seem to work. It just outputs to the local dir.
		var output = exec('"' + ref + '" ' + args, done);
		output.stdout.on('data', handle);
		output.stderr.on('data', handle);
		args = done = null;
	}
}

function pvk2pfx(args, done) {
	finder.find('pvk2pfx.exe', found);

	function found(ref) {
		if (!ref) {
			throw 'Could not find pvk2pfx.exe. Please make sure you have a supported version of .NET installed.';
		}
		// Note: simplify specifying the full path to /out= doesn't seem to work. It just outputs to the local dir.
		var output = exec('"' + ref + '" ' + args, done);
		output.stdout.on('data', handle);
		output.stderr.on('data', handle);
		args = done = null;
	}
}

/*
 Utility.
 */
function handle(data) {
	if (data) {
		log.debug(data);
	}
}
