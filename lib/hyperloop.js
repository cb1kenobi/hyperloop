/**
 * hyperloop compiler module
 */
var path = require('path'),
	_ = require('underscore'),
	os = require('os'),
	fs = require('fs'),
	colors = require('colors'),
	log = require('./log'),
	compiler = require('./compiler'),
	appc = require('node-appc'),
	util = require('./util'),
	wrench = require('wrench'),
	crypto = require('crypto'),
	commands = {};

/**
 * Default options.
 */
var defaultOptions = {
	name: 'App',
	src: process.cwd(),
	dest: 'build',
	debug: false,
	'log-level': 'info'
};
switch (process.platform) {
	case 'win32':
		var vs2013 = fs.existsSync('C:/Program Files (x86)/Microsoft Visual Studio 12.0') || fs.existsSync('C:/Program Files/Microsoft Visual Studio 12.0');
		defaultOptions.platform = 'windows';
		defaultOptions.sdk = vs2013 ? '8.1' : '8.0';
		defaultOptions.configuration = 'Debug';
		break;
	case 'darwin':
		defaultOptions.platform = 'ios';
		defaultOptions.classprefix = 'hl_';
		defaultOptions.environment = 'dev';
		defaultOptions.appid = 'com.test.app';
		break;
	default:
		defaultOptions.platform = 'android';
		break;
}

/**
 * get a list of exported commands that hyperloop supports
 */
exports.getCommands = function() {
	var result = [];
	Object.keys(commands).forEach(function(c) {
		result.push(commands[c]);
	});
	return result;
};

/**
 * execute a specific command
 */
exports.run = function(command, options, args) {
	options = _.defaults(options || {}, defaultOptions);
	options.command = command;
	var cmd = commands[command];
	if (!cmd) {
		log.fatal('invalid command: ', command);
	}
	if (options.launch) {
		log.error('--launch has been replaced with the new "launch" command:');
		log.fatal(('hyperloop launch ' + process.argv.slice(3).join(' ').replace(/\s*--launch/ig, '')).bold);
	}
	delete options.colors; // we don't need our color config
	cmd.execute(options, args);
};

/**
 * base class for commands
 */
function Command(name, desc, func) {
	this.description = desc;
	this.command = func;
	this.name = name;
}

Command.prototype.getName = function() {
	return this.name;
};

Command.prototype.getHelp = function() {
	return this.description;
};

Command.prototype.execute = function(options, args) {
	try {
		this.command(options, args);
	}
	catch (e) {
		log.fatal(e);
	}
};

/**
 * Compile the app.
 */
commands['compile'] = new Command('compile', 'compile source files', function(options, args, callback) {

	required(options, 'src', 'specify the directory of files to be compiled, or a specific file to compile');
	required(options, 'dest', 'specify the directory where files will be generated');
	required(options, 'platform', 'specify the platform to target such as ios, windows, android, etc');

	var platform = options.platform,
		src = appc.fs.resolvePath(options.src),
		isDir = util.isDirectory(src),
		codegen = new (require(path.join(__dirname, platform, 'codegen.js')).Codegen)(options),
		SourceFile = require(path.join(__dirname, platform, 'sourcefile.js')).SourceFile,
		prefix = options.prefix ? options.prefix + '/' : '',
		classprefix = options.classprefix || '',
		asts = [];

	log.trace('options: ' + JSON.stringify(options, null, '  '));

	if (isDir && !fs.existsSync(path.join(src, 'app.hjs')) &&
		!fs.existsSync(path.join(src, 'app.js'))) {
		log.fatal('No app.hjs or app.js file found in', src.yellow);
	}

	// On Windows, include .json files, as well. Otherwise, just include .hjs and .js files.
	var fileFilter = process.platform === 'win32' ? /\.(h?js|json)$/ : /\.h?js$/;
	var files = isDir ? filelisting(src, fileFilter, undefined, options.dest) : [src];
	if (files.length === 0) {
		log.fatal('No source files found at', src.magenta);
	}

	if (!fs.existsSync(options.dest)) {
		wrench.mkdirSyncRecursive(options.dest);
	}

	// force an option for the src directory
	options.srcdir = path.join(options.dest, 'src');

	var env = options.environment,
		env_dev = /^dev/i.test(env) || !env,
		env_prod = /^prod/i.test(env),
		env_test = /^test/i.test(env),
		build_opts = {
			"DEBUG": options.debug || false,
			"TITANIUM_VERSION": "0.0.0",
			"TITANIUM_BUILD_HASH": "",
			"TITANIUM_BUILD_DATE": new Date().toString(),
			"OS_IOS": /(ios|iphone|ipad)/i.test(platform),
			"OS_IPHONE": /(ios|iphone)/i.test(platform),
			"OS_IPAD": /(ios|ipad)/i.test(platform),
			"OS_ANDROID": /(android)/i.test(platform),
			"OS_BLACKBERRY": /(blackberry)/i.test(platform),
			"OS_WINDOWS": /(windows)/i.test(platform),
			"OS_WEB": /(web|html)/i.test(platform),
			"OS_MOBILEWEB": /(web|html)/i.test(platform),
			"OS_TIZEN": /(tizen)/i.test(platform),
			"ENV_DEV": env_dev,
			"ENV_DEVELOPMENT": env_dev,
			"ENV_TEST": env_test,
			"ENV_PRODUCTION": env_prod
		},
		ti_key = /^ti-/i,
		hl_key = /^hl-/i;

	// attempt to pass in any additional keys from command line which will
	// customize our compression
	Object.keys(options).forEach(function(k) {
		var value = options[k];
		if (ti_key.test(k)) {
			k = k.replace(ti_key, 'TITANIUM_').replace(/-/g, '_').toUpperCase();
			build_opts[k] = value;
		} else if (hl_key.test(k)) {
			k = k.replace(hl_key, 'HYPERLOOP_').replace(/-/g, '_').toUpperCase();
			build_opts[k] = value;
		} else {
			build_opts[k.toUpperCase()] = value;
		}
	});


	files.forEach(function(filename) {
		if (!fs.existsSync(filename)) {
			log.fatal("Couldn't find source file", filename.magenta);
		}

		var relativeFilename = isDir ? filename.replace(path.resolve(src), '') : src,
			relativeFilename = relativeFilename.charAt(0) === '/' ? relativeFilename.substring(1) : relativeFilename,
			isHJS = /\.hjs$/.test(relativeFilename),
			jsfilename = classprefix + relativeFilename.replace(/[\s-\/]/g, '_').replace(/\.h?js$/, ''), // replace invalid chars
			relativeFilename = prefix + relativeFilename,
			source = fs.readFileSync(filename).toString(),
			sourceHash = crypto.createHash('md5').update(source).digest('hex'),
			sourcefile = new SourceFile(relativeFilename, jsfilename, options, args),
			ast = isHJS && compiler.compile(source, './' + jsfilename + '.js', jsfilename, sourcefile, build_opts);

		asts.push({ast: ast, sourcefile: sourcefile, filename: filename, jsfilename: jsfilename, sourceHash: sourceHash});
		codegen.addSource(sourcefile);

		if (isHJS) {
			sourcefile = new SourceFile(jsfilename + '_sm', jsfilename + '_sm');
			codegen.addSource(sourcefile);
		}
	});

	var sourceMapFile = path.join(__dirname, '..', 'deps', '_source-map.js');
	var sourceMapDest = path.join(options.dest, 'src');
	if (!fs.existsSync(sourceMapDest)) {
		wrench.mkdirSyncRecursive(sourceMapDest);
	}
	var sourceMapFileDest = path.join(sourceMapDest, classprefix+'_source_map.js');
	util.copyFileSync(sourceMapFile, sourceMapFileDest);
	var source = fs.readFileSync(sourceMapFile).toString();
	var sourceHash = crypto.createHash('md5').update(source).digest('hex');
	var sourcefile = new SourceFile('/'+classprefix+'_source_map.js', classprefix+'_source_map', {}, {});
	asts.push({ast: null, sourcefile: sourcefile, filename: sourceMapFileDest, jsfilename: classprefix+'_source_map', sourceHash: sourceHash});
	codegen.addSource(sourcefile);

	function generateASTs(asts) {
		log.debug('using JS compress options:', JSON.stringify(build_opts).grey);

		var sourceResults = {},
			sourceMaps = [];

		asts.forEach(function(entry) {
			var sourcefile = entry.sourcefile,
				filename = entry.filename,
				jsfilename = entry.jsfilename,
				sourceHash = entry.sourceHash,
				jssrc = path.join(options.dest, 'src', jsfilename + '.js'),
				sourcecode, compressed;

			if (entry.ast) {
				compressed = compiler.compress(entry.ast, build_opts, filename, './' + jsfilename + '.js');
				sourcecode = compressed.code;
				sourceMaps.push({name: jsfilename + '_sm', filename: '/' + jsfilename + '_sm', code: compressed.map});
			} else {
				// this is just plain ole JS, not HJS
				sourcecode = fs.readFileSync(filename).toString();
			}

			if (options.debug && process.platform != 'win32') {
				fs.writeFileSync(jssrc, sourcecode);
				log.debug('wrote output JS at', jssrc.yellow);
			}

			sourcefile.finish(sourcecode);

			// map our generate source into our results
			sourceResults[sourcefile.filename] = sourcecode;
		});

		// turn our sourcemaps into code that will be native compiled as well
		//
		// TODO: in an ideal world, the sourcecode code will just be stored in the
		// native compiled file of the original source instead of a separate compiled file
		sourceMaps.forEach(function(sm) {
			sourceResults[sm.filename] = sm.code;
			var sourcefile = new SourceFile(sm.filename, sm.name, {}, {});
			codegen.addSource(sourcefile);
		});

		return sourceResults;
	}

	codegen.generate(asts, generateASTs, function(err) {
		finishedCommand('compile');
		err && log.fatal(err);
		if (callback) {
			callback();
		}
		else {
			log.exit(0);
		}
	});
});

/**
 * Compile then package the app.
 */
commands['package'] = new Command('package', 'package source files', function(options, args, callback) {

	required(options, 'src', 'specify the directory where files should be compiled');
	required(options, 'platform', 'specify the platform to target such as ios, windows, android, etc');

	var parentCommand = commands['compile'],
		platform = options.platform,
		Packager = require(path.join(__dirname, platform, 'packager.js')).Packager,
		packager = new Packager(options);

	// validate args before we compile
	var result = packager.validate(options, args, required, proceed);
	if (result) {
		proceed();
	}

	function proceed() {
		parentCommand.command(options, args, function compileFinished() {
			packager.package(options, args, function(err) {
				finishedCommand('package');
				err && log.fatal(err);
				if (callback) {
					callback();
				}
				else {
					log.exit(0);
				}
			});
		});
	}
});

/**
 * Package then launch the app.
 */
commands['launch'] = new Command('launch', 'package then launch the app', function(options, args, callback) {
	var parentCommand = commands['package'],
		platform = options.platform,
		Launcher = require(path.join(__dirname, platform, 'launcher.js')).Launcher,
		launcher = new Launcher(options);

	parentCommand.command(options, args, function packageFinished() {
		launcher.launch(options, args, function(err) {
			finishedCommand('launch');
			err && log.fatal(err);
			if (callback) {
				callback();
			}
			else {
				log.exit(0);
			}
		});
	});
});

/**
 * Clean the destination directory.
 */
commands['clean'] = new Command('clean', 'removes the build folder', function(options, args, callback) {

	required(options, 'dest', 'specify the directory where files will be generated');

	if (options.uninstall) {

		// only run on windows
		if (!/^win/.test(process.platform)) {
			log.fatal("`hyperloop clean --uninstall` only supported on Windows");
		}
		var programs = require('./windows/programs');

		// remove all apps with hyperloop prefix
		programs.powershell('"get-appxpackage \'hyperlooptest.*\' | remove-appxpackage"', function(err) {
			if (err) {
				log.error('There was an error uninstalling apps');
				log.fatal(err);
			}
			finishedCommand('clean --uninstall');

			// pass back flow, or exit
			if (callback) {
				return callback();
			} else {
				log.exit(0);
			}
		});
	} else if (fs.existsSync(options.dest)) {
		try {
			wrench.rmdirSyncRecursive(options.dest);
			log.info('Cleaned ' + options.dest.yellow);
		} catch (e) {
			if (/EBUSY/.test(e.message) && /^win/.test(process.platform)) {
				log.error(e.message);
				log.error('Try "File -> Close Solution" in Visual Studio, then run clean again.');
			}
			log.error('Failed to clean the destination.');
			log.fatal(e);
		}
		finishedCommand('clean');
		if (callback) {
			callback();
		}
		else {
			log.exit(0);
		}
	}

});

/*
 Utility functions.
 */

/**
 * Check to make sure that the `name` key is present in `options` and if not
 * exit with the error message `help`
 */
function required(options, name, help) {
	if (!options[name]) {
		log.fatal('Missing required options ' + ('--' + name).magenta.bold + ' which should ' + help);
	}
}

/**
 * Recursively get a listing of files for a given directory
 */
function filelisting(dir, filter, files, dest) {
	files = files || [];
	fs.readdirSync(dir).forEach(function(f) {
		if (f === dest) {
			return;
		}
		f = path.join(path.resolve(dir), f);
		if (util.isDirectory(f)) {
			filelisting(f, filter, files, dest);
		}
		else {
			filter.test(f) && files.push(f);
		}
	});
	return files;
}

/**
 * log how long a particular command took to run
 */
var executionStartedAt = Date.now();
function finishedCommand(command) {
	log.trace(command.yellow + ' finished in ' + String((Date.now() - executionStartedAt) / 1000).yellow + ' seconds.\n\n');
	executionStartedAt = Date.now();
}
