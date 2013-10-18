var _ = require('underscore'),
	buildlib = require('./buildlib'),
	clangparser = require('./clangparser'),
	fs = require('fs'),
	log = require('../log'),
	spawn = require('child_process').spawn,
	spinner = require('../spinner'),
	util = require('util'),
	zlib = require('zlib');

// module interface

exports.loadMetabase = loadMetabase;

/**
 * Loads the metabase either from the cache, or creates a new one.
 * On success, the callback will be executed with a JSON representation
 * of the clang AST.
 *
 * @param {String}   file The file to be run through clang
 * @param {Object}   [opts={}] Options for metabase creation
 * @param {Boolean}  [opts.arc=false] Whether or not to use automatic reference counting
 * @param {String}   [opts.cacheFile] Path to tcheck for AST cache file
 * @param {String}   [opts.minVersion="7.0"] The minimum iOS SDK version
 * @param {Array}    [opts.nativeArgs=[]] Arguments to pass straight to the clang CLI
 * @param {Function} callback Executed upon completion or error
 *
 * @returns {void}
 */
function loadMetabase(file, opts, callback) {

	// validate arguments
	callback = arguments[arguments.length-1] || function(){};
	if (!_.isString(file)) {
		throw new TypeError('file argument must be a string');
	}
	if (_.isFunction(opts) || !opts) {
		opts = {};
	} else if (!_.isObject(opts)) {
		throw new TypeError('Bad arguments');
	}

	// set defaults
	opts = _.defaults(opts, {
		arc: false,
		minVersion: '7.0',
		nativeArgs: [],
		cacheFile: process.env['TMPDIR']
	});

	var cacheFile = opts.cacheFile,
		thisTime, lastTime;

	// see if we have a cache file
	if (cacheFile && fs.existsSync(cacheFile)) {
		return loadCache(cacheFile, callback);

	// generate a new metabase
	} else {

		// base timestamp
		lastTime = Date.now();

		// execute clang and get the AST
		execClang(file, opts, function(err, result) {

			if (err) { return callback(err); }

			thisTime = Date.now();
			log.debug('Generated clang AST in', timeDiff(thisTime, lastTime), 'seconds.');
			lastTime = thisTime;

			spinner.start(
				'Generating system metabase'.green.bold,
				'Generating system metabase will take up to a minute (or greater) dependening on your ' +
				'environment. This file will be cached and will execute faster on subsequent builds.'
			);

			clangparser.parseBuffer(result, function(err, ast) {

				if (err) { return callback(err); }

				thisTime = Date.now();
				spinner.stop();
				log.debug('Generated AST cache file at', cacheFile, 'in', timeDiff(thisTime, lastTime), 'seconds');
				lastTime = thisTime;

				var astJSON = ast.toJSON();
				zlib.gzip(JSON.stringify(astJSON, null, '  '), function(err, buf) {
					fs.writeFile(cacheFile, buf, function() {
						return callback(null, astJSON);
					});
				});
			});
		});
	}
};


/**
 * Load the metabase from a cache file
 *
 * @param {String} cacheFile The location of the cached metabase
 * @param {Function} callback Executed upon completion or error
 *
 * @returns {void}
 */
function loadCache(cacheFile, callback) {
	log.debug('Using system metabase cache file at', cacheFile.yellow);
	try {
		fs.readFile(cacheFile, function(err, buf) {
			if (/\.gz$/.test(cacheFile)) {
				zlib.gunzip(buf, function(err, buf) {
					return callback(null, JSON.parse(String(buf)));
				});
			} else {
				return callback(null, JSON.parse(String(buf)));
			}
		});
	} catch(E) {
		return callback(E);
	}
}

/**
 * Execute clang to get raw AST for given file
 *
 * @param {String}   file The file to be run through clang
 * @param {Object}   [opts={}] Options for metabase creation
 * @param {Boolean}  [opts.arc=false] Whether or not to use automatic reference counting
 * @param {String}   [opts.minVersion="7.0"] The minimum iOS SDK version
 * @param {Array}    [opts.nativeArgs=[]] Arguments to pass straight to the clang CLI
 * @param {Function} callback Executed upon completion or error
 *
 * @returns {void}
 */
function execClang(file, opts, callback) {

	// get xcode settings
	buildlib.getXcodeSettings(function(err, settings) {

		// handle errors
		if (err) { return callback(err); }

		// construct the clang command
		var stdout = '',
			stderr = '',
			args = buildlib.getDefaultCompilerArgs(!opts.arc).concat(
				opts.nativeArgs || [],
				util.format('-arch i386 -mios-simulator-version-min=%s -isysroot %s ' +
					'-x objective-c -Xclang -ast-dump --analyze -fno-color-diagnostics ' +
					'-fretain-comments-from-system-headers',
					opts.minVersion, settings.simSDKPath).split(/\s+/),
				[file]
			);

		log.debug('clang arguments are: ', args.join(" ").grey);

		// launch clang
		var cmd = spawn(settings.clang, args, { env: process.env });
		cmd.stdout.on('data',function(buf) {
			stdout += buf.toString();
		});
		cmd.stderr.on('data',function(buf) {
			stderr += buf.toString();
		});
		cmd.on('close', function(exitCode) {
			cmd = null;

			// should probably just check "exitCode" as truthy
			if (stderr) {
				return callback(new Error(stderr));
			}

			return callback(null, stdout);
		});

	});
}

function timeDiff(thisTime, lastTime) {
	return ((thisTime - lastTime) / 1000).toFixed(3);
}
