/**
 * build library utility for xcode / ios platform
 */
var exec = require('child_process').exec,
	spawn = require('child_process').spawn,
	path = require('path'),
	fs = require('fs'),
	async = require('async'),
	_ = require('underscore'),
	wrench = require('wrench'),
	log = require('../log'),
	util = require('../util'),
	debug = false,
	settings,
	xcodepath,
	sysframeworks,
	sysframeworkDir;

/**
 * return the currently configured active xcode path
 */
function getXcodePath(callback) {
	if (xcodepath) {
		return callback(null,xcodepath);
	}
	var cmd = "/usr/bin/xcode-select -print-path";
	exec(cmd, function(err, stdout, stderr){
		err && callback(new Error(stderr));
		callback(null,(xcodepath=stdout.trim()));
	});
}

/**
 * get the system frameworks
 */
function getSystemFrameworks(callback) {
	if (sysframeworks) {
		return callback(null, sysframeworks, sysframeworkDir);
	}
	getXcodeSettings(function(err,settings){
		if (err) return callback(err);
		var r = /\.framework$/,
			frameworkDir = sysframeworkDir = path.join(settings.simSDKPath,'System','Library','Frameworks');
		fs.readdir(frameworkDir, function(err,paths) {
			if (err) return callback(err);
			sysframeworks = _.filter(paths,function(v) {
				if (r.test(v) && fs.existsSync(path.join(frameworkDir,v,'Headers'))) {
					return v;
				}
			});
			callback(null, sysframeworks, frameworkDir);
		});
	});
}

function getXcodeSettingsCached() {
	return settings;
}

/**
 * get the current Xcode settings such as paths for build tools
 */
function getXcodeSettings (callback) {
	if (settings) {
		return callback(null,settings);
	}
	getXcodePath(function(err,xcode){
		if (err) { log.fatal(err); }
		var devicePath = path.join(xcode,'Platforms','iPhoneOS.platform'),
			simPath = path.join(xcode,'Platforms','iPhoneSimulator.platform'),
			simSDKsDir = path.join(simPath,'Developer','SDKs'),
			deviceSDKsDir = path.join(devicePath,'Developer','SDKs'),
			usrbin = path.join(xcode,'Toolchains','XcodeDefault.xctoolchain','usr','bin'),
			clang = path.join(usrbin,'clang'),
			libtool = path.join(usrbin, 'libtool'),
			lipo = path.join(usrbin, 'lipo'),
			otool = path.join(usrbin, 'otool'),
			sdks;

		try {
			sdks = fs.readdirSync(deviceSDKsDir);
		} catch (e) {
			log.error('iOS Developer directory not found at "' + xcode + '". Run:');
			log.error(' ');
			log.error('    /usr/bin/xcode-select -print-path');
			log.error(' ');
			log.error('and make sure it exists and contains your iOS SDKs. If it does not, run:');
			log.error(' ');
			log.error('    sudo /usr/bin/xcode-select -switch /path/to/Developer');
			log.error(' ');
			log.error('and try again. Here\'s some guesses:');
			log.fatal(JSON.stringify(['/Developer','/Library/Developer','/Applications/Xcode.app/Contents/Developer'], null, '  '));
		}
		if (sdks.length===0) {
			return callback(new Error('no SDKs found at '+deviceSDKsDir));
		}
		var versions = [];
		sdks.forEach(function(f){
			var v = f.replace('.sdk','').replace('iPhoneOS','');
			versions.push(v);
		});
		versions = versions.length > 1 ? versions.sort() : versions;
		var version = versions[versions.length-1],
			simSDKPath = path.join(simSDKsDir, 'iPhoneSimulator'+version+'.sdk'),
			deviceSDKPath = path.join(deviceSDKsDir, 'iPhoneOS'+version+'.sdk');

		callback(null,(settings = {
			xcodePath: xcode,
			version: version,
			clang: clang,
			libtool: libtool,
			lipo: lipo,
			otool: otool,
			simSDKPath: simSDKPath,
			deviceSDKPath: deviceSDKPath
		}));
	});
}

/**
 * create a command function wrapper
 */
function createFn (cmd) {
	return function(callback) {
		debug && log.log(cmd);
		exec(cmd,callback);
	};
}

/**
 * utility to check the results of a async task and
 * throw Error or print to console on output / debug
 */
function checkResults(err,results,callback) {
	if (err) return callback(new Error(err)) && false;
	var stderr = [],
		stdout = [];
	results.forEach(function(result){
		result[0] && stdout.push(String(result[0]));
		result[1] && stderr.push(String(result[1]));
	});
	if (stderr.length) return callback(new Error(stderr.join('\n'))) && false;
	if (stdout.length) log.log(stdout.join('\n'));
	return true;
}

function staticlib(config, callback) {

	var minVersion = config.minVersion,
		libname = config.libname,
		objfiles = config.objfiles || {}, // will error below
		outdir = config.outdir,
		linkflags = config.linkflags || [],
		linkTasks = [],
		libfiles = {};

	if (Object.keys(objfiles).length===0) {
		return callback(new Error('no object file(s) specified'));
	}
	if (!fs.existsSync(outdir)) {
		fs.mkdir(outdir);
	}

	getXcodeSettings(function(err,settings){
		var archs = [],
			sdks = {
				'i386': {path: settings.simSDKPath, name:'ios-simulator'},
				'armv7s': {path: settings.deviceSDKPath, name:'iphoneos'},
				'armv7': {path: settings.deviceSDKPath, name:'iphoneos'},
				'arm64': {path: settings.deviceSDKPath, name:'iphoneos'}
			};

		minVersion = minVersion || settings.version;
		config.debug && log.debug('setting minimum iOS version to', minVersion);

		Object.keys(sdks).forEach(function(sdk){

			var sdkObj = sdks[sdk],
				sysRoot = sdkObj.path,
				sdkName = sdkObj.name,
				dir = path.join(outdir, sdk),
				objs = objfiles[sdk],
				minOSString = '-m'+sdkName+'-version-min='+minVersion;

			if (!objs||objs.length===0) return;

			// create temp build directory for each platform
			if (!fs.existsSync(dir)) {
				fs.mkdir(dir);
			}

			// we must exclude -l<library> from the libtool linker line
			var validlinkflags = linkflags.filter(function(f){ return (!/^-l/.test(f)); });

			var libFile = path.join(outdir, libname.replace(/\.a$/,'-'+sdk+'.a')),
				linkCmd = settings.libtool + ' ' + validlinkflags.join(' ') + ' -static -arch_only ' + sdk + ' -syslibroot ' + sysRoot + ' ' + objs.join(' ') + ' -o ' + libFile,
				fn = createFn(linkCmd);

			archs.push('-arch '+sdk+' '+libFile);
			linkTasks.push(fn);
			libfiles[sdk] = libFile;
			config.debug && log.debug('static lib command: ',objs.join(',').cyan,'to',libFile.cyan);
			config.debug && log.debug(linkCmd);
		});

		// link all the files
		async.series(linkTasks, function(err,results) {
			if (checkResults(err,results,callback)) {
				// lipo together all the static libraries
				var libfile = path.join(outdir, libname),
					lipoCmd = settings.lipo + ' -create ' + archs.join(' ') + ' -output ' + libfile;
				exec(lipoCmd, function(err, stdout, stderr) {
					if (err) return callback(new Error(err));
					debug && (stdout=String(stdout).trim()) && log.log(stdout);
					if ((stderr=String(stderr).trim()) && stderr) return new Error(err);
					// done!
					callback(null, libfile, libfiles);
				});
			}
		});

	});
}

function getDefaultCompilerArgs(no_arc) {
	return [
		'-O0', '-g',
		'-fobjc-abi-version=2','-fobjc-legacy-dispatch',
		no_arc ? '' : '-fobjc-arc',
		'-fpascal-strings','-fexceptions','-fasm-blocks','-fstrict-aliasing',
		'-fmessage-length=0','-fdiagnostics-show-note-include-stack','-fmacro-backtrace-limit=0',
		'-fmodules'
	];
}

function compile(config, callback) {

	var minVersion = config.minVersion,
		srcfiles = config.srcfiles || [], // will error below
		outdir = config.outdir,
		cflags = config.cflags || [],
		error = false,
		no_arc = config.no_arc;

	if (!srcfiles || srcfiles.length===0) {
		return callback(new Error('no source(s) specified'));
	}
	if (!fs.existsSync(outdir)) {
		fs.mkdir(outdir);
	}

	getXcodeSettings(function(err,settings){
		var compileTasks = [],
			objfiles_by_os = {},
			deletefiles = [],
			template = getDefaultCompilerArgs(no_arc),
			sdks = {
				'i386': {path: settings.simSDKPath, name:'ios-simulator'},
				'arm64': {path: settings.deviceSDKPath, name:'iphoneos'},
				'armv7': {path: settings.deviceSDKPath, name:'iphoneos'},
				'armv7s': {path: settings.deviceSDKPath, name:'iphoneos'}
			};

		minVersion = minVersion || settings.version;
		config.debug && log.debug('setting minimum iOS version to', minVersion);

		Object.keys(sdks).forEach(function(sdk){
			if (error) return;

			// if simulator only, we only want to build the i386 srcs
			if (config.simulator_only && sdk!=='i386') {
				return;
			}

			objfiles_by_os[sdk] = [];

			var sdkObj = sdks[sdk],
				sysRoot = sdkObj.path,
				sdkName = sdkObj.name,
				dir = path.join(outdir, sdk),
				minOSString = '-m'+sdkName+'-version-min='+minVersion;

			// create temp build directory for each platform
			if (!fs.existsSync(dir)) {
				fs.mkdir(dir);
			}

			// collect all the source compile commands
			srcfiles.forEach(function(src){
				if (error) return;

				if (!fs.existsSync(src)) {
					error=true;
					return callback(new Error("couldn't find source file: "+src));
				}

				var lang = 'objective-c',
					basename = path.basename(src);

				if (/\.cpp$/.test(basename)) {
					// we need to rename to .mm for clang to compile
					// just copy into our temp dir
					var tmp = path.join(dir, path.basename(src).replace(/\.cpp$/,'.mm')),
						srcContents = fs.readFileSync(src);
					fs.writeFileSync(tmp,srcContents);
					src = tmp;
					deletefiles.push(tmp); // so it can be deleted (otherwise rmdir fails)
					// switch to objective-c++
					lang = 'objective-c++';
				}
				else if (/\.mm$/.test(basename)) {
					// switch to objective-c++
					lang = 'objective-c++';
				}

				// this are for Crash detection library (KSCrash)
				var crashEnabled = cflags.filter(function(f){ return f.indexOf('-DHL_DISABLE_CRASH')!==-1; }).length===0,
					kst;
				if (crashEnabled) {
					// check sym links which won't happen dependent on installation env
					kst = path.join(util.writableHomeDirectory(),'KSCrash.framework');
					if (!fs.existsSync(kst)) {
						var ks = path.join(__dirname,'../../deps/ios/KSCrash.framework');
						wrench.copyDirSyncRecursive(ks,kst);
						// make the symlinks necessary for build
						var cwd = process.cwd();
						process.chdir(kst);
						try { fs.symlinkSync('Versions/Current/Headers','Headers','dir'); } catch (E) {}
						try { fs.symlinkSync('Versions/Current/KSCrash','KSCrash','dir'); } catch (E) {}
						try { fs.symlinkSync('Versions/Current/Resources','Resources','dir'); } catch (E) {}
						process.chdir(path.join(kst,'Versions'));
						try { fs.symlinkSync('A','Current','dir'); } catch (E) {}
						process.chdir(cwd);
					}
				}


				var outfile = path.join(dir, basename.replace(/\.m[m]?$/,'.o')),
					cflag = crashEnabled ? '-F"'+path.dirname(kst)+'"' : '',
					cmd = template.concat(cflags).concat([minOSString]).concat(['-c','-o']).concat([outfile, src]).join(' '),
					compileCmd = settings.clang + ' ' + cflag + ' -x ' + lang + ' -arch ' + sdk + ' -isysroot ' + sysRoot + ' ' + cmd,
					fn = createFn(compileCmd);

				objfiles_by_os[sdk].push(outfile);
				config.debug && log.debug('compiling ',src.cyan,'to',outfile.cyan);
				compileTasks.push(fn);
				config.debug && log.debug('compile command: ',compileCmd.cyan);
			});

			if (error) return;

		});

		if (!err) {
			// since parallel can cause a TOO MANY OPEN FILES error
			// when compiling a ton of files in parallel, we need to
			// queue them
			var MAX_COMPILE_TASK = config.jobs || 50,
				results = [],
				q = async.queue(function(task,callback){
					task(function(err,stdout,stderr){
						results.push([stdout,stderr]);
						callback();
					});
				},Math.min(compileTasks.length,MAX_COMPILE_TASK));
			log.debug('running up to',MAX_COMPILE_TASK,'parallel compile tasks. specify --jobs=N to change the number of parallel compile tasks');
			log.info('Compiling',compileTasks.length,'source files');
			q.drain = function() {
				if (checkResults(null,results,callback)) {
					if (deletefiles.length) {
						async.map(deletefiles,fs.unlink,function(err,results){
							callback(null, objfiles_by_os, settings);
						});
					}
					else {
						callback(null, objfiles_by_os, settings);
					}
				}
				q = null;
				compileTasks = null;
				results = null;
			};
			q.push(compileTasks);
			return;
		}
	});
}

/**
 * perform a one-step compile of a set of sources and then link them
 * into a universal shared library
 */
function compileAndMakeStaticLib(options, callback) {
	compile(options, function(err, objfiles_by_os) {
		if (err) return callback(err);
		options.objfiles = objfiles_by_os;
		staticlib(options, function(err, libfile, libfiles) {
			if (err) return callback(err);
			return callback(null, {
				objfiles: objfiles_by_os,
				libfile: libfile,
				libfiles: libfiles
			});
		});
	});
}

function xcodebuild(dir, args, callback) {
	var p = spawn('xcodebuild',args, {cwd:dir,env:process.env}),
		stdout = '',
		stderr = '';
	p.stdout.on('data',function(buf){
		stdout+=buf.toString();
	});
	p.stderr.on('data',function(buf){
		buf = buf.toString();
		// ignore these types of messages
		if (/Using pre-existing current store/.test(buf)) {
			return;
		}
		stderr+=buf;
	});
	p.on('close', function(exitCode){
		p = null;
		log.debug(stdout)
		if (stderr && exitCode!=0) {
			return callback(new Error(stderr));
		}
		callback(null, stdout);
	});
}

exports.getXcodePath = getXcodePath;
exports.getXcodeSettings = getXcodeSettings;
exports.getXcodeSettingsCached = getXcodeSettingsCached;
exports.getSystemFrameworks = getSystemFrameworks;
exports.getDefaultCompilerArgs = getDefaultCompilerArgs;
exports.compile = compile;
exports.staticlib = staticlib;
exports.xcodebuild = xcodebuild;
exports.compileAndMakeStaticLib = compileAndMakeStaticLib;

exports.__defineGetter__('debug', function(){
	return debug;
});
exports.__defineSetter__('debug',function(v){
	debug = v;
});

if (module.id === ".") {
	try {
		//debug = true;
		var build_dir = path.join(__dirname,'..','..','build'),
			srcdir = path.join(__dirname,'..','..','test','src'),
			srcfiles = fs.readdirSync(srcdir).map(function(f){return path.join(srcdir,f)});

		var config = {
			minVersion:'7.0',
			libname: 'libfoo.a',
			srcfiles: srcfiles,
			outdir: build_dir,
			cflags: ['-DFOO'],
			linkflags: ['-framework Foundation']
		};

		compileAndMakeStaticLib(config, function(err,results){
			log.log(results)
		});

	}
	catch(E){
		log.error(E);
	}
}
