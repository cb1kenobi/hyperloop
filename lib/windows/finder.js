var fs = require('fs'),
	log = require('../log'),
	path = require('path');


/*
 Public API.
 */
exports.find = find;

/**
 * These search paths are relative to Program Files. We'll also check in x86. They're roughly ordered by preferred versions.
 */
// TODO: These paths don't seem very future proof, yeah? User should be able to specify the SDK version to use.
var searchPaths = [
		// platform.winmd
		'Microsoft SDKs/Windows/v8.1/ExtensionSDKs/Microsoft.VCLibs/12.0/References/CommonConfiguration/neutral',
		'Microsoft Visual Studio 12.0/VC/vcpackages',
		'Microsoft SDKs/Windows/v8.0/ExtensionSDKs/Microsoft.VCLibs/11.0/References/CommonConfiguration/neutral',
		'Microsoft Visual Studio 11.0/VC/vcpackages',
		'Microsoft Visual Studio 11.0/VC/WPSDK/WP80/lib',
		'Microsoft Visual Studio 11.0/VC/WPSDK/WP80/lib/arm',
		// ildasm.exe
		'Microsoft SDKs/Windows/v8.1A/bin/NETFX 4.5.1 Tools/x64',
		'Microsoft SDKs/Windows/v8.0A/bin/NETFX 4.0 Tools/x64',
		'Microsoft SDKs/Windows/v8.0A/bin/NETFX 4.0 Tools',
		'Microsoft SDKs/Windows/v7.0A/Bin/x64',
		'Microsoft SDKs/Windows/v7.0A/Bin/NETFX 4.0 Tools/x64',
		'Microsoft SDKs/Windows/v7.0A/Bin/NETFX 4.0 Tools',
		'Microsoft SDKs/Windows/v7.0A/Bin/NETFX 4.0 Tools',
		'Microsoft SDKs/Windows/v7.0A/Bin',
		// makecert.exe, pvk2pfx.exe
		'Windows Kits/8.1/bin/x64',
		'Windows Kits/8.0/bin/x64',
		'Windows Kits/8.0/bin/x86',
		'Microsoft SDKs/Windows/v7.1A/Bin/x64',
		'Microsoft SDKs/Windows/v7.1A/Bin'
	],
	searchPathsBySDK = {
		// Windows.winmd
		'8.0': [
			'Windows Kits/8.0/References/CommonConfiguration/Neutral',
			'Windows Kits/8.0/App Certification Kit/winmds/windows8',
			'Windows Kits/8.1/App Certification Kit/winmds/windows8'
		],
		'8.1': [
			'Windows Kits/8.1/App Certification Kit/winmds/windows81',
			'Windows Kits/8.1/References/CommonConfiguration/Neutral'
		]
	};

/*
 Implementation.
 */

function find(name, sdk, done) {
	if (done === undefined) {
		done = sdk;
		sdk = undefined;
	}
	log.debug('looking for ' + name.yellow + (sdk ? ' (in sdk ' + sdk.yellow + ')' : ''));
	var programFiles = process.env['programfiles'],
		programFilesX86 = process.env['programfiles(x86)'],
		paths = sdk ? searchPathsBySDK[sdk] : searchPaths;
	for (var i = 0, iL = paths.length; i < iL; i++) {
		var partial = paths[i] + '/' + name,
			possibles = [
				programFilesX86 + '/' + partial,
				programFiles + '/' + partial
			];
		for (var j = 0, jL = possibles.length; j < jL; j++) {
			if (!fs.existsSync(possibles[j])) {
				log.trace(name.bold + ' not in ' + possibles[j].bold);
				continue;
			}
			log.trace(name.bold + ' FOUND in ' + possibles[j].yellow + '!');
			return done(path.resolve(possibles[j]));
		}
	}
	log.trace(name.bold + ' not found!');
	done();
}