var hyperloop = require('../../lib/hyperloop'),
	log = require('../../lib/log'),
	should = require('should'),
	_ = require('underscore');

var FATAL = 'fatal';

describe('lib/hyperloop.js', function() {

	describe('#getCommands', function() {

		it('returns an array of supported commands', function() {
			var commands = hyperloop.getCommands();
			should.exist(commands);
			commands.should.be.an.Array;
			commands.length.should.be.above(0);
			_.find(commands, function(c) { return c.name === 'compile'; }).should.be.ok;
		});

		it('returned commands have #getName and #getHelp', function() {
			var commands = hyperloop.getCommands();
			should.exist(commands);
			commands.should.be.an.Array;
			commands.length.should.be.above(0);

			var cmd = commands[0];
			var name = cmd.getName();
			var help = cmd.getHelp();
			name.should.be.a.String;
			name.should.equal(cmd.name);
			help.should.be.a.String;
			help.should.equal(cmd.description);
		});

	});

	describe('#run', function() {

		beforeEach(function() {
			this._fatal = log.fatal;
			log.fatal = function() {
				throw new Error(arguments[0] || FATAL);
			};
		});

		it('aborts when no argument is given', function() {
			(function() {
				hyperloop.run();
			}).should.throw(/invalid command/);
		});

		it('throws without options, but not a conversion error', function() {
			(function() {
				hyperloop.run('compile');
			}).should.throw(/^(?:(?!null to object).)*$/);
		});

		afterEach(function() {
			log.fatal = this._fatal;
		});

	});

});