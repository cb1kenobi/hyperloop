/**
 * Windows 8 WinMD File Finder
 */
var fs = require('fs'),
	path = require('path'),
	log = require('util/log'),
	exec = require('child_process').exec;

/*
 Config.
 */
/**
 * These search paths are relative to Program Files. We'll also check in x86.
 */
// TODO: These paths don't seem very future proof, yeah? Search for relevant folders, rather than hard coding.
var winmdSearchPaths = [
		// Known locations for platform.winmd
		// (in order of preference)
		'Microsoft SDKs/Windows/v8.1/ExtensionSDKs/Microsoft.VCLibs/12.0/References/CommonConfiguration/neutral',
		'Microsoft Visual Studio 12.0/VC/vcpackages',
		'Microsoft SDKs/Windows/v8.0/ExtensionSDKs/Microsoft.VCLibs/11.0/References/CommonConfiguration/neutral',
		'Microsoft Visual Studio 11.0/VC/vcpackages',
		'Microsoft Visual Studio 11.0/VC/WPSDK/WP80/lib',
		'Microsoft Visual Studio 11.0/VC/WPSDK/WP80/lib/arm',
		'Windows Kits/8.1/App Certification Kit/winmds/windows81',
		// Known locations for Windows.winmd
		'Windows Kits/8.1/App Certification Kit/winmds/windows81',
		'Windows Kits/8.1/References/CommonConfiguration/Neutral',
		'Windows Kits/8.0/References/CommonConfiguration/Neutral',
		'Windows Kits/8.1/App Certification Kit/winmds/windows8',
		'Microsoft Visual Studio 12.0/Blend/WinMD',
		'Windows Phone Kits/8.0/Windows MetaData',
		'Microsoft Visual Studio 11.0/Blend/WinMD',
		'Microsoft SDKs/Windows Phone/v8.0/Tools/MDILXAPCompile/WinMDs'
	],
	ildasmSearchPaths = [
		'Microsoft SDKs/Windows/v8.1A/bin/NETFX 4.5.1 Tools/x64',
		'Microsoft SDKs/Windows/v8.0A/bin/NETFX 4.0 Tools/x64',
		'Microsoft SDKs/Windows/v8.0A/bin/NETFX 4.0 Tools',
		'Microsoft SDKs/Windows/v7.0A/Bin/x64',
		'Microsoft SDKs/Windows/v7.0A/Bin/NETFX 4.0 Tools/x64',
		'Microsoft SDKs/Windows/v7.0A/Bin/NETFX 4.0 Tools',
		'Microsoft SDKs/Windows/v7.0A/Bin/NETFX 4.0 Tools',
		'Microsoft SDKs/Windows/v7.0A/Bin'
	];

/*
 Public API.
 */
exports.find = find;
exports.ildasm = ildasm;

/*
 Implementation.
 */
function find(name, done) {
	findInProgramFiles(winmdSearchPaths, name, done);
}

function ildasm(ref, to, done) {
	findInProgramFiles(ildasmSearchPaths, 'ildasm.exe', found);

	function found(ildasmRef) {
		if (!ildasmRef) {
			throw 'Could not find ildasm.exe. Please make sure you have a supported version of .NET installed.';
		}
		// Note: simplify specifying the full path to /out= doesn't seem to work. It just outputs to the local dir.
		var output = exec('cd %temp% && "' + ildasmRef + '" /out="' + to + '" "' + ref + '"', disassembled);
		output.stdout.on('data', handle);
		output.stderr.on('data', handle);
	}

	function handle(data) {
		if (data) {
			log.debug(data);
		}
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

/*
 Utility.
 */
function findInProgramFiles(paths, name, done) {
	var programFiles = process.env['programfiles'],
		programFilesX86 = process.env['programfiles(x86)'];
	for (var i = 0, iL = paths.length; i < iL; i++) {
		var partial = paths[i] + '/' + name,
			possibles = [
				programFilesX86 + '/' + partial,
				programFiles + '/' + partial
			];
		for (var j = 0, jL = possibles.length; j < jL; j++) {
			if (!fs.existsSync(possibles[j])) {
				continue;
			}
			return done(path.resolve(possibles[j]));
		}
	}
	done();
}