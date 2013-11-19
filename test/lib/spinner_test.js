var log = require('../../lib/log'),
	spinner = require('../../lib/spinner');

describe('lib/spinner.js', function() {

	beforeEach(function() {
		this._level = log.level;
		log.level = 'error';
	});

	describe('#start', function() {

		it('quietly exits when logging is set to quiet', function() {
			log.level = 'quiet';
			(function() {
				spinner.start();
			}).should.not.throw();
		});

		it('strip colors based on log options', function() {
			var _useColor = log.useColor;
			log.useColor = false;
			spinner.start();
			spinner.stop();
			log.useColor = _useColor;
		});

	});

	describe('#stop', function() {

		it('stops without error if start was not called', function() {
			(function() {
				spinner.stop();
			}).should.not.throw();
		});

	});

	it('starts and stops without error', function() {
		(function() {
			spinner.start('message', 'prefix');
			spinner.stop();
		}).should.not.throw();

		(function() {
			spinner.start(undefined, 'prefix');
			spinner.stop();
		}).should.not.throw();

		(function() {
			spinner.start('message');
			spinner.stop();
		}).should.not.throw();

		(function() {
			spinner.start();
			spinner.stop();
		}).should.not.throw();

	});

	it('executes play interval', function(done) {
		(function() {
			spinner.start();
			setTimeout(function() {
				spinner.stop();
				done();
			}, 250);
		}).should.not.throw();
	});

	it('executes play interval with stripped colors', function(done) {
		var _useColor = log.useColor;
		log.useColor = false;
		(function() {
			spinner.start();
			setTimeout(function() {
				spinner.stop();
				log.useColor = _useColor;
				done();
			}, 250);
		}).should.not.throw();
	});

	afterEach(function() {
		log.level = this._level;
		spinner.stop();
	});

});