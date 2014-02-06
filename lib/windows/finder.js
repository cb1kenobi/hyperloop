var fs = require('fs'),
	os = require('os'),
	log = require('../log'),
	path = require('path');

var programFiles = process.env['programfiles'],
	programFilesX86 = process.env['programfiles(x86)'],
	windows = process.env['windir'],
	envPaths = process.env.path.split(';'),
	is64Bit = os.arch() === 'x64' || process.env.hasOwnProperty('PROCESSOR_ARCHITEW6432'),
	foundCache = {};

/*
 Public API.
 */
exports.find = find;
exports.findHeader = findHeader;
exports.headerSearchPaths = headerSearchPaths;

/**
 * These search paths are relative to Program Files. We'll also check in x86. They're roughly ordered by preferred versions.
 */
// TODO: These paths don't seem very future proof, yeah? User should be able to specify the SDK version to use.
var searchPaths = [
		// platform.winmd
		checkX86('Microsoft SDKs/Windows/v8.1/ExtensionSDKs/Microsoft.VCLibs/12.0/References/CommonConfiguration/neutral'),
		checkX86('Microsoft Visual Studio 12.0/VC/vcpackages'),
		checkX86('Microsoft SDKs/Windows/v8.0/ExtensionSDKs/Microsoft.VCLibs/11.0/References/CommonConfiguration/neutral'),
		checkX86('Microsoft Visual Studio 11.0/VC/vcpackages'),
		checkX86('Microsoft Visual Studio 11.0/VC/WPSDK/WP80/lib'),
		checkX86('Microsoft Visual Studio 11.0/VC/WPSDK/WP80/lib/arm'),
		// ildasm.exe
		checkX86('Microsoft SDKs/Windows/v8.1A/bin/NETFX 4.5.1 Tools/x64'),
		checkX86('Microsoft SDKs/Windows/v8.0A/bin/NETFX 4.0 Tools/x64'),
		checkX86('Microsoft SDKs/Windows/v8.0A/bin/NETFX 4.0 Tools'),
		checkX86('Microsoft SDKs/Windows/v7.0A/Bin/x64'),
		checkX86('Microsoft SDKs/Windows/v7.0A/Bin/NETFX 4.0 Tools/x64'),
		checkX86('Microsoft SDKs/Windows/v7.0A/Bin/NETFX 4.0 Tools'),
		checkX86('Microsoft SDKs/Windows/v7.0A/Bin/NETFX 4.0 Tools'),
		checkX86('Microsoft SDKs/Windows/v7.0A/Bin'),
		// makecert.exe, pvk2pfx.exe
		checkX86('Windows Kits/8.1/bin/x64'),
		checkX86('Windows Kits/8.0/bin/x64'),
		checkX86('Windows Kits/8.0/bin/x86'),
		checkX86('Microsoft SDKs/Windows/v7.1A/Bin/x64'),
		checkX86('Microsoft SDKs/Windows/v7.1A/Bin'),
		// clang
		checkX86('LLVM/bin')
	].filter(fs.existsSync).filter(remove64BitWhen32Bit),
	searchPathsBySDK = {
		// Windows.winmd
		'8.0': [
			checkX86('Windows Kits/8.0/References/CommonConfiguration/Neutral'),
			checkX86('Windows Kits/8.0/App Certification Kit/winmds/windows8'),
			checkX86('Windows Kits/8.1/App Certification Kit/winmds/windows8'),
			windows + '/Microsoft.NET/Framework64/v4.0.30319',
			windows + '/Microsoft.NET/Framework/v4.0.30319',
			windows + '/Microsoft.NET/assembly/GAC_64/MSBuild/v4.0_4.0.0.0__b03f5f7f11d50a3a',
			windows + '/Microsoft.NET/assembly/GAC_32/MSBuild/v4.0_4.0.0.0__b03f5f7f11d50a3a'
		].filter(fs.existsSync),
		'8.1': [
			checkX86('Windows Kits/8.1/App Certification Kit/winmds/windows81'),
			checkX86('Windows Kits/8.1/References/CommonConfiguration/Neutral'),
			checkX86('MSBuild/12.0/Bin'),
			windows + '/Microsoft.NET/assembly/GAC_64/MSBuild/v4.0_12.0.0.0__b03f5f7f11d50a3a',
			windows + '/Microsoft.NET/assembly/GAC_32/MSBuild/v4.0_12.0.0.0__b03f5f7f11d50a3a'
		].filter(fs.existsSync)
	};

/*
 Implementation.
 */

function find(name, sdk) {
	var cacheKey = name + '_' + sdk;
	if (foundCache[cacheKey] !== undefined) {
		return foundCache[cacheKey];
	}

	log.debug('looking for ' + name.yellow + (sdk ? ' (in sdk ' + sdk.yellow + ')' : ''));
	var paths = sdk ? searchPathsBySDK[sdk] : searchPaths;
	return findFileInPaths(paths, name, cacheKey);
}

function findHeader(paths, name, sdk) {
	var cacheKey = name + '_' + sdk;
	if (foundCache[cacheKey] !== undefined) {
		return foundCache[cacheKey];
	}
	var searchPaths = headerSearchPaths(paths, sdk, true);
	log.debug('looking for header ' + name.yellow + (sdk ? ' (in sdk ' + sdk.yellow + ')' : ''));
	return findFileInPaths(searchPaths, name, cacheKey);
}

function checkX86(p) {
	return path.resolve((fs.existsSync(programFilesX86 + '/' + p)
		? programFilesX86
		: programFiles) + '/' + p);
}

function headerSearchPaths(paths, sdk, includeVCInstallDir) {
	var VCInstallDir = 'Microsoft Visual Studio ' + sdkToVC(sdk) + '/VC/',
		WindowsSDK_IncludePath = 'Windows Kits/' + sdk + '/Include/',
		search = [
			paths.srcDir,
			checkX86(VCInstallDir + 'atlmfc/include'),
			checkX86(WindowsSDK_IncludePath + 'WinRT'),
			checkX86(WindowsSDK_IncludePath + 'shared'),
			checkX86(WindowsSDK_IncludePath + 'um'),
			path.join(paths.jscDir, 'include')
		];
	// There seems to be a bug in clang where, if we pass this in the header search paths while parsing, it can crash.
	// This reproduces with examples/windows/direct3d.
	if (includeVCInstallDir) {
		search.push(checkX86(VCInstallDir + 'include'));
	}
	return search.filter(fs.existsSync);
}

/*
 Utility.
 */

function sdkToVC(sdk) {
	switch (sdk) {
		case '8.0':
			return '11.0';
		case '8.1':
			return '12.0';
	}
}

function findFileInPaths(paths, name, cacheKey) {
	paths = paths.concat(envPaths);
	for (var i = 0, iL = paths.length; i < iL; i++) {
		var partial = paths[i] + '/' + name;
		if (!fs.existsSync(partial)) {
			log.trace(name.bold + ' not in ' + paths[i].bold);
		}
		else {
			var result = foundCache[cacheKey] = path.resolve(partial);
			log.trace(name.bold + ' FOUND at ' + result.yellow + '!');
			return result;
		}
	}
	log.trace(name.bold + ' not found!');
	foundCache[cacheKey] = false;
	return undefined;
}

function remove64BitWhen32Bit(path) {
	return is64Bit
		? true
		: path.indexOf('64') === -1;
}