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

var reportBuffer = [];

exports.report = false;
exports.level = 'info';
exports.useColor = true;
exports.shouldLog = shouldLog;
exports.exit = exit;

// export log functions based on level definitions
Object.keys(levels).forEach(function(key) {
	if (key === 'quiet') { return; }
	exports[key] = function() {
		log.apply(this, [key].concat(Array.prototype.slice.call(arguments)));
		if (key === 'fatal') {
			shouldLog('debug') && console.trace(' ');
			exit(1);
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
 * Exits the process, giving the logger an opportunity to --report, if necessary.
 * @param statusCode
 */
function exit(statusCode) {
	function indentify(text) {
		return '\t' + text.split('\n').join('\n\t');
	}

	if (exports.report) {
		// TODO: Use the --platform= to determine the label.
		var programToCopy = process.platform === 'win32' ? 'clip' : process.platform === 'darwin' ? 'pbpaste' : 'xclip',
			programToOpenBrowser = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open',
			labels = process.platform === 'win32' ? 'win8' : process.platform === 'darwin' ? 'ios' : 'android',
			body = '';

		body += '## Please Describe Your Issue\n\n\n';
		body += '\n\n## Log Trace\nPlease paste your log trace between the quotes below (hint: it should already be in your clipboard).\n```\n\n```\n';
		body += '\n\n### When Running Command\n\t' + process.argv.join(' ');
		body += '\n\n### Node Versions\n' + indentify(JSON.stringify(process.versions, undefined, 4));
		body += '\n\n### OS';
		[ 'type', 'platform', 'arch', 'release', 'totalmem', 'freemem' ].forEach(function(key) {
			body += '\n**' + key + '**: ' + require('os')[key]();
		});

		var fs = require('fs'),
			os = require('os'),
			exec = require('child_process').exec,
			url = 'https://github.com/appcelerator/hyperloop/issues/new?' +
				'labels=' + labels + '&' +
				'body=' + encodeURIComponent(body),
			trace = reportBuffer.join(os.EOL);

		if (process.platform === 'win32') {
			url = url.replace(/&/g, '^&');
		}

		fs.writeFileSync('./trace.log', trace);
		console.log('Copying log trace to your clipboard, and then opening GitHub issues for Hyperloop.');
		exec(programToCopy + ' < trace.log');
		exec(programToOpenBrowser + ' ' + url);

		// Busy wait for 1 second to give the browser time to launch.
		var until = Date.now() + 2000;
		while (until > Date.now()) {}
	}
	process.exit(statusCode);
}

// main log function
function log() {
	var key  = arguments[0];
	var args = Array.prototype.slice.call(arguments, 1) || [];
	var obj = levels[key];
	
	exports.report && reportBuffer.push(obj.prefix + args.join(' ').stripColors);

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
