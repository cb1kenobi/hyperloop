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
		color: '\x1b[37m',
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

// export log functions based on level definitions
Object.keys(levels).forEach(function(key) {
	if (key === 'quiet') { return; }
	exports[key] = function() {
		log.apply(this, [key].concat(Array.prototype.slice.call(arguments)));
		if (key === 'fatal') {
			process.exit(1);
		}
	};
});

// main log function
function log() {
	var key  = arguments[0];
	var args = Array.prototype.slice.call(arguments, 1) || [];
	var obj = levels[key];

	// skip logging if log level is too low
	if (obj.level < levels[exports.level].level) { return; }

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
