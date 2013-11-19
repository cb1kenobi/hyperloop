if (process.platform !== 'darwin') return;

var _ = require('underscore'),
	fs = require('fs'),
	log = require('../../lib/log'),
	metabase = require('../../lib/ios/metabase'),
	path = require('path'),
	should = require('should');

var headerFile = path.join(__dirname, 'src', 'header.h'),
	cacheFile = path.join((process.env['TMPDIR'] || '/tmp'), 'hyperloop_ios_metabase_test.json.gz');

// turn off logging during testing
log.level = 'quiet';

// make sure testing is set, in case this is run directly
process.env['HYPERLOOP_TEST'] = 1;

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

		['6.0', '6.0.1', '1', '3.3.3.3'].forEach(function(version) {
			it('should return error when given "' + version + '" as opts.minVersion', function(done) {
				metabase.loadMetabase(headerFile, { minVersion: version }, function(err, result) {
					should.exist(err);
					err.should.match(/iOS SDK minimum/i);
					done();
				});
			});
		});

		['7.0.0.1', '7.0-tag'].forEach(function(version) {
			it('should return error when given "' + version + '" as opts.minVersion', function(done) {
				metabase.loadMetabase(headerFile, {
					minVersion: version,
					cacheFile: 'dummyfile'
				}, function(err, result) {
					should.exist(err);
					err.should.match(/-mios-simulator-version-min/i);
					done();
				});
			});
		});

		it('should successfully load metabase', function(done) {
			this.timeout(60000);

			metabase.loadMetabase(headerFile, { cacheFile: cacheFile }, function(err, result) {
				if (err) { return done(err); }
				verifyMetabase(result);
				done();
			});
		});

		it('should successfully load metabase with no options', function(done) {
			metabase.loadMetabase(headerFile, function(err, result) {
				if (err) { return done(err); }
				verifyMetabase(result);
				done();
			});
		});

		[
			{ cacheFile: cacheFile, nativeArgs: ['-I' + __dirname] },
			{ cacheFile: cacheFile, arc: false },
			{ cacheFile: cacheFile, nativeArgs: ['-I' + __dirname], arc: false, minVersion: '7.0' }
		].forEach(function(opts) {
			it('should successfully load metabase with ' + JSON.stringify(Object.keys(opts)), function(done) {
				metabase.loadMetabase(headerFile, opts, function(err, result) {
					if (err) { return done(err); }
					verifyMetabase(result);
					done();
				});
			});
		});

	});

});

function verifyMetabase(mb) {
	mb.should.be.an.Object;
	mb.system_frameworks.should.be.an.Array;
	_.contains(mb.system_frameworks, 'Foundation').should.be.true;
}