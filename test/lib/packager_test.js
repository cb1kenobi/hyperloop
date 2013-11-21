var Packager = require('../../lib/packager').Packager,
	should = require('should');

var RX_NOT_IMPLEMENTED = /not implemented/;

describe('lib/packager.js', function() {

	it('creates new instances of Packager', function() {
		var options = { opt1: 123, opt2: 'value' },
			packager = new Packager(options);

		should.exist(packager);
		packager.options.should.equal(options);
		packager.package.should.be.a.Function;
		packager.validate.should.be.a.Function;
	});

	it('throws when #package is called, as it requires implementation', function() {
		(function() {
			var packager = new Packager();
			packager.package();
		}).should.throw(RX_NOT_IMPLEMENTED);
	});

	it('throws when #validate is called, as it requires implementation', function() {
		(function() {
			var packager = new Packager();
			packager.validate();
		}).should.throw(RX_NOT_IMPLEMENTED);
	});

});