/**
 * log utility
 */
var _ = require('underscore'),
	colors = require('colors');

var RESET = '\x1b[39m';
var levels = {
	trace: {
		prefix: '[TRACE] ',
		color: '\x1B[90m',
		level: 1
	},
	debug: {
		prefix: '[DEBUG] ',
		color: '\x1b[36m',
		level: 2
	},
	info: {
		prefix: '[INFO]  ',
		color: '\x1b[32m',
		level: 3
	},
	log: {
		prefix: '',
		color: '\x1b[37m',
		level: 3
	},
	warn: {
		prefix: '[WARN]  ',
		color: '\x1b[33m',
		level: 4
	},
	error: {
		prefix: '[ERROR] ',
		color: '\x1b[31m',
		level: 5
	},
	fatal: {
		prefix: '[ERROR] ',
		color: '\x1b[31m',
		level: 5
	},
	quiet: {
		level: 99
	}
};

exports.level = 'info';
exports.useColor = true;
exports.shouldLog = shouldLog;

// export log functions based on level definitions
Object.keys(levels).forEach(function(key) {
	if (key === 'quiet') { return; }
	exports[key] = function() {
		log.apply(this, [key].concat(Array.prototype.slice.call(arguments)));
		if (key === 'fatal') {
			shouldLog('debug') && console.trace(' ');
			process.exit(1);
		}
	};
});

/**
 * Check if the passed in logging level (such as trace, debug, etc) should be output, based on the currently set global
 * log-level.
 * @param key
 * @returns {boolean}
 */
function shouldLog(key) {
	var thisLevel = levels[key].level,
		globalLevel = levels[exports.level].level;
	return thisLevel >= globalLevel;
}

/**
 * Spins through the provided arguments, looking for any exceptions, and logging their stack trace as log.debug.
 * @param args The arguments to search for exceptions.
 */
function logStackFromArguments(args) {
	for (var i = 0, iL = args.length; i < iL; i++) {
		var e = args[i];
		if (e.origError && e.origError.stack) {
			log('debug', e.origError.stack);
		} else if (e.stack) {
			log('debug', e.stack);
		}
	}
}

// main log function
function log() {
	var key  = arguments[0];
	var args = Array.prototype.slice.call(arguments, 1) || [];
	var obj = levels[key];

	// skip logging if log level is too low
	if (!shouldLog(key)) return;

	// trim end string
	var len = args.length;
	if (len && _.isString(args[len-1])) {
		args[len-1] = args[len-1].trim();
	}

	// add prefix to first argument
	if (args[0]) {
		args[0] = obj.color + obj.prefix + RESET + args[0];
	}

	// strip color, if necessary
	if (!exports.useColor) {
		for (var i = 0; i < args.length; i++) {
			_.isString(args[i]) && (args[i] = args[i].stripColors);
		}
	}

	// execute the log call
	console.log.apply(this, args);
}
