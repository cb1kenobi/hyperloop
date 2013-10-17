var _ = require('underscore'),
	buildlib = require('./buildlib'),
	log = require('../log'),
	spawn = require('child_process').spawn,
	util = require('util');

/**
 * generate clang AST for given file
 */
exports.clang = function clang(file, opts, callback) {

	// validate arguments
	callback = arguments[arguments.length-1] || function(){};
	if (!_.isString(file)) {
		throw new Error('file argument must be a string');
	}
	if (_.isFunction(opts) || !opts) {
		opts = {};
	} else if (!_.isObject(opts)) {
		throw new TypeError('Bad arguments');
	}

	// set default
	opts = _.defaults(opts, {
		arc: false,
		minVersion: '7.0',
		nativeArgs: []
	});

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

		console.log('clang arguments are: ', args.join(" ").grey);

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
