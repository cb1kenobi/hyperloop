var metabase = require('../../lib/ios/metabase'),
	log = require('../../lib/log'),
	path = require('path'),
	should = require('should');

var headerFile = path.join(__dirname, 'src', 'header.h'),
	cacheFile = path.join((process.env['TMPDIR'] || '/tmp'), 'hyperloop_ios_metabase_test.json.gz');

// turn off logging during testing
log.level = 'quiet';

describe('ios metabase', function() {

	describe('#loadMetabase', function() {

		it('should throw when given no params', function() {
			(function() {
				metabase.loadMetabase();
			}).should.throw();
		});

		[123, false, null, undefined, function(){}, {}, []].forEach(function(o) {
			it('should throw when given "' + o + '" as first param', function() {
				(function() {
					metabase.loadMetabase(o);
				}).should.throw(/file argument/i);
			});
		});

		[123, true].forEach(function(o) {
			it('should throw when given "' + o + '" as second param', function() {
				(function() {
					metabase.loadMetabase(headerFile, o);
				}).should.throw(/bad argument/i);
			});
		});

		it('should successfully load metabase', function(done) {
			this.timeout(60000);

			metabase.loadMetabase(headerFile, { cacheFile: cacheFile }, function(err, result) {
				if (err) { return done(err); }

				result.should.be.an.Object;
				done();
			});
		});
	});

	// TODO: more success test cases, using varying param combinations and options

});