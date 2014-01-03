var Codegen = require('../../lib/codegen').Codegen,
	should = require('should');

var DUMMY = 'dummy',
	RX_NOT_IMPLEMENTED = /not implemented/;

describe('lib/codegen.js', function() {

	it('creates new instances of Codegen', function() {
		var options = { opt1: 123, opt2: 'value' },
			codegen = new Codegen(options);

		should.exist(codegen);
		codegen.options.should.equal(options);
		codegen.sources.should.eql([]);
		codegen.generate.should.be.a.Function;
		codegen.addSource.should.be.a.Function;
	});

	it('throws when #generate is called, as it requires implementation', function() {
		(function() {
			var codegen = new Codegen();
			codegen.generate();
		}).should.throw(RX_NOT_IMPLEMENTED);
	});

	it('#addSource adds source items', function() {
		var codegen = new Codegen();
		codegen.addSource(DUMMY);
		codegen.sources[0].should.equal(DUMMY);
	});

	it('#addSource with no arguments executes without error', function() {
		var codegen = new Codegen();
		codegen.addSource();
		(typeof codegen.sources[0]).should.equal('undefined');
	});

});