require('../../lib/test');

describe('lib/test.js', function() {

	it('initializes HYPERLOOP_TEST and TMPDIR', function() {
		process.env.HYPERLOOP_TEST.should.equal('1');
		process.env.TMPDIR.should.be.a.String;
		process.env.TMPDIR.length.should.be.above(0);
	});

	it('initializes TMPDIR if it is not defined');

});