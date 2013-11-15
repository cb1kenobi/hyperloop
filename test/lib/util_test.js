var fs = require('fs'),
	path = require('path'),
	should = require('should'),
	util = require('../../lib/util'),
	wrench = require('wrench');

var TMP = path.join('.', '_tmp'),
	DUMMY = '/dummy/path/that/so/doesnt/exist';

describe('util.js', function() {

	describe('#copyFileSync', function() {

		var SRC_FILE = path.join(TMP, 'srcfile.txt'),
			DEST_FILE = path.join(TMP, 'destfile.txt'),
			SRC_CONTENT = 'His name is Robert Paulson.';

		beforeEach(function() {
			if (fs.existsSync(TMP)) {
				wrench.rmdirSyncRecursive(TMP);
			}
			wrench.mkdirSyncRecursive(TMP, 0755);
			fs.writeFileSync(SRC_FILE, SRC_CONTENT);
		});

		it('throws when given bad arguments', function() {
			[
				[undefined, undefined],
				[undefined, '/dummy/path'],
				['/dummy/path', undefined]
			].forEach(function(args) {
				(function() {
					util.copyFileSync(args[0], args[1]);
				}).should.throw(/Bad arguments/);
			});
		});

		it('throws when given non-existant files', function() {
			[
				[SRC_FILE, DUMMY],
				[DUMMY, DEST_FILE]
			].forEach(function(args) {
				(function() {
					util.copyFileSync(args[0], args[1]);
				}).should.throw(/no such file/);
			});
		});

		it('does not copy default filtered files', function() {
			['.CVS','.svn','.git','.DS_Store'].forEach(function(file) {
				var fullpath = path.join(TMP, file);
				fs.writeFileSync(fullpath, SRC_CONTENT);
				util.copyFileSync(fullpath, DEST_FILE);
				fs.existsSync(DEST_FILE).should.be.false;
			});
		});

		it('copies a file', function() {
			util.copyFileSync(SRC_FILE, DEST_FILE);
			fs.existsSync(DEST_FILE).should.be.true;
			fs.readFileSync(DEST_FILE, 'utf8').should.equal(SRC_CONTENT);
		});

		it('does not copy a file that fails filter', function() {
			util.copyFileSync(SRC_FILE, DEST_FILE, function(src, dest) {
				return false;
			});
			fs.existsSync(DEST_FILE).should.be.false;
		});

		it('copies a file that passes filter', function() {
			util.copyFileSync(SRC_FILE, DEST_FILE, function(src, dest) {
				return true;
			});
			fs.existsSync(DEST_FILE).should.be.true;
			fs.readFileSync(DEST_FILE, 'utf8').should.equal(SRC_CONTENT);
		});

		it('does not copy a file when an invalid filter is given', function() {
			util.copyFileSync(SRC_FILE, DEST_FILE, 'WTF, I should be a function');
			fs.existsSync(DEST_FILE).should.be.false;
		});

	});

	describe('#guid', function() {

		it('returns a 36 character string', function() {
			var guid = util.guid();
			should.exist(guid);
			guid.should.be.a.String;
			guid.length.should.equal(36);
		});

	});

});