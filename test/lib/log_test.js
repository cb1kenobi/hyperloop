var log = require('../../lib/log'),
	should = require('should');

var DUMMY = 'dummy message',
	RESET = '\x1b[39m';

describe('lib/log.js', function() {

	[
		{ name: 'trace', color: '\x1B[90m'},
		{ name: 'debug', color: '\x1B[36m'},
		{ name: 'info', color: '\x1B[32m'},
		{ name: 'log', color: '\x1B[37m'},
		{ name: 'warn', color: '\x1B[33m'},
		{ name: 'error', color: '\x1B[31m'}
	].forEach(function(level) {

		describe('#' + level.name, function() {

			it('prints message to console without color', function() {
				// mock console.log here, because it interferes with test reporting
				// if we do it in beforeEach() and afterEach()
				var _log = console.log, _message;
				console.log = function() {
					_message = arguments[0];
				};

				// set log level and color usage, execute
				log.level = level.name;
				log.useColor = false;
				log[level.name](DUMMY);

				// reset console.log
				console.log = _log;

				// run the test
				should.exist(_message);
				_message.should.equal(getPrefix(level.name) + DUMMY);
			});

			it('prints message to console with color', function() {
				// mock console.log here, because it interferes with test reporting
				// if we do it in beforeEach() and afterEach()
				var _log = console.log, _message;
				console.log = function() {
					_message = arguments[0];
				};

				// set log level and color usage, execute
				log.level = level.name;
				log.useColor = true;
				log[level.name](DUMMY);

				// reset console.log
				console.log = _log;

				// run the test
				should.exist(_message);
				_message.should.equal(level.color + getPrefix(level.name) + RESET + DUMMY);
			});

			it('executes without error with no arguments', function() {
				// mock console.log here, because it interferes with test reporting
				// if we do it in beforeEach() and afterEach()
				var _log = console.log, _message;
				console.log = function() {
					_message = arguments[0];
				};

				// set log level and color usage, execute
				log.level = level.name;
				log.useColor = false;
				log[level.name]();

				// reset console.log
				console.log = _log;

				// run the test
				should.not.exist(_message);
			});

			it('prints nothing if log level is quiet', function() {
				// mock console.log here, because it interferes with test reporting
				// if we do it in beforeEach() and afterEach()
				var _log = console.log, _message;
				console.log = function() {
					_message = arguments[0];
				};

				// set log level and color usage, execute
				log.level = 'quiet';
				log.useColor = false;
				log[level.name](DUMMY);

				// reset console.log
				console.log = _log;

				// run the test
				should.not.exist(_message);
			});

		});

	});

	describe('#fatal', function() {

		it('prints error message then aborts application');

	});

});

function getPrefix(name) {
	if (name === 'log') { return ''; }
	var prefix = '[' + name.toUpperCase() + ']';
	while (prefix.length < 8) { prefix += ' '; }
	return prefix;
}