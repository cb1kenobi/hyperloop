var fs = require('fs'),
	log = require('../../lib/log'),
	nock = require('nock'),
	appc = require('node-appc'),
	path = require('path'),
	should = require('should'),
	util = require('../../lib/util'),
	wrench = require('wrench');

var TMP = path.join('.', '_tmp'),
	DUMMY = '/dummy/path/that/so/doesnt/exist',
	RX_NO_SUCH_FILE = /no such file/,
	RX_BAD_ARGUMENT = /Bad argument/;

describe('lib/util.js', function() {

	describe('#copyAndFilterEJS', function() {
		var ejsObj = { key1: 'this is key 1', key2: 'another key' },
			SRC_FILE = path.join(TMP, 'srcfile.txt'),
			DEST_FILE = path.join(TMP, 'destfile.txt'),
			SRC_CONTENT = '<%=key1%>\n<%=key2%>',
			DEST_CONTENT = 'this is key 1\nanother key';

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
					util.copyAndFilterEJS(args[0], args[1]);
				}).should.throw(RX_BAD_ARGUMENT);
			});
		});

		it('throws when given non-existant files', function() {
			[
				[SRC_FILE, DUMMY],
				[DUMMY, DEST_FILE]
			].forEach(function(args) {
				(function() {
					util.copyAndFilterEJS(args[0], args[1], ejsObj);
				}).should.throw(RX_NO_SUCH_FILE);
			});
		});

		it('renders and writes an EJS template', function() {
			util.copyAndFilterEJS(SRC_FILE, DEST_FILE, ejsObj);
			fs.readFileSync(DEST_FILE, 'utf8').should.equal(DEST_CONTENT);
		});

	});

	describe('#copyAndFilterString', function() {
		var obj = { key1: 'this is key 1', key2: 'another key' },
			SRC_FILE = path.join(TMP, 'srcfile.txt'),
			DEST_FILE = path.join(TMP, 'destfile.txt'),
			SRC_CONTENT = 'key1\nkey2',
			DEST_CONTENT = 'this is key 1\nanother key';

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
					util.copyAndFilterString(args[0], args[1]);
				}).should.throw(RX_BAD_ARGUMENT);
			});
		});

		it('throws when given non-existant files', function() {
			[
				[SRC_FILE, DUMMY],
				[DUMMY, DEST_FILE]
			].forEach(function(args) {
				(function() {
					util.copyAndFilterString(args[0], args[1], obj);
				}).should.throw(RX_NO_SUCH_FILE);
			});
		});

		it('renders and writes the string template', function() {
			util.copyAndFilterString(SRC_FILE, DEST_FILE, obj);
			fs.readFileSync(DEST_FILE, 'utf8').should.equal(DEST_CONTENT);
		});

	});

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
				}).should.throw(RX_BAD_ARGUMENT);
			});
		});

		it('throws when given non-existant files', function() {
			[
				[SRC_FILE, DUMMY],
				[DUMMY, DEST_FILE]
			].forEach(function(args) {
				(function() {
					util.copyFileSync(args[0], args[1]);
				}).should.throw(RX_NO_SUCH_FILE);
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

	describe('#downloadResourceIfNecessary', function() {
		this.timeout(30 * 1000);

		var NAME = 'ios-sim',
			VERSION = '1',
			CHECKSUM = '2ae5a9c551424e427f2322433250263ca12da582',
			BAD_CHECKSUM = 'c17d918f30c212e0642e4c33650bfb654493120b',
			URL = 'http://timobile.appcelerator.com.s3.amazonaws.com/ios-sim/ios-sim-' + VERSION + '.zip',
			DIR = TMP;

		beforeEach(function() {
			wrench.rmdirSyncRecursive(TMP);
			wrench.mkdirSyncRecursive(TMP, 0755);

			log.level = 'quiet';
			this._progress = appc.progress;
			this._unzip = appc.zip.unzip;

			appc.progress = function(){
				this.tick = function(){};
			};
			appc.zip.unzip = function(file, dir, callback) {
				callback();
			};

			nock('http://timobile.appcelerator.com.s3.amazonaws.com')
				.get('/ios-sim/ios-sim-' + VERSION + '.zip')
				.reply(200, 'the data', {'content-length':8});
		});

		it('throws if any of its required arguments are not defined', function() {
			(function() { util.downloadResourceIfNecessary(); }).should.throw(RX_BAD_ARGUMENT);
			(function() { util.downloadResourceIfNecessary('name'); }).should.throw(RX_BAD_ARGUMENT);
			(function() { util.downloadResourceIfNecessary('name', 'version'); }).should.throw(RX_BAD_ARGUMENT);
			(function() { util.downloadResourceIfNecessary('name', 'version', 'url'); }).should.throw(RX_BAD_ARGUMENT);
			(function() { util.downloadResourceIfNecessary('name', 'version', 'url', 'checksum'); }).should.throw(RX_BAD_ARGUMENT);
		});

		it('returns error when receives bad reply', function(done) {
			nock.cleanAll();
			nock('http://timobile.appcelerator.com.s3.amazonaws.com')
				.get('/ios-sim/ios-sim-' + VERSION + '.zip')
				.reply(404);

			util.downloadResourceIfNecessary(NAME, VERSION, URL, CHECKSUM, DIR, function(err) {
				should.exist(err);
				err.toString().should.match(/error loading/);
				done();
			});
		});

		it('returns error when receives bad checksum', function(done) {
			util.downloadResourceIfNecessary(NAME, VERSION, URL, BAD_CHECKSUM, DIR, function(err) {
				should.exist(err);
				err.should.match(/checksum/);
				done();
			});
		});

		it('returns error it encounters unzip error', function(done) {
			appc.zip.unzip = function(file, dir, callback) {
				callback('error');
			};

			util.downloadResourceIfNecessary(NAME, VERSION, URL, CHECKSUM, DIR, function(err) {
				should.exist(err);
				err.should.equal('error');
				done();
			});
		});

		it('executes without error when given valid parameters', function(done) {
			util.downloadResourceIfNecessary(NAME, VERSION, URL, CHECKSUM, DIR, function(err) {
				should.not.exist(err);

				util.downloadResourceIfNecessary(NAME, VERSION, URL, BAD_CHECKSUM, DIR, function(err) {
					should.not.exist(err);
					done();
				});
			});
		});

		afterEach(function() {
			appc.progress = this._progress;
			appc.zip.unzip = this._unzip;
			log.level = 'info';
			nock.cleanAll();
		});

	});

	describe('#escapePaths', function() {

		it('throws if a defined, non-string argument is given', function() {
			[123, function(){}, true, {foo:'bar'}, [1,2,3]].forEach(function(arg) {
				(function() {
					util.escapePaths(arg);
				}).should.throw(RX_BAD_ARGUMENT);
			});
		});

		it('should escape paths', function() {
			util.escapePaths().should.equal('');
			util.escapePaths('/path/to/something').should.equal('/path/to/something');
			util.escapePaths('/path/to/something else').should.equal('/path/to/something\\ else');
			util.escapePaths('/path/to/"something"').should.equal('/path/to/\\"something\\"');
			util.escapePaths('/path/\'to/so\'mething').should.equal('/path/\\\'to/so\\\'mething');
			util.escapePaths('/path/to$$$/something').should.equal('/path/to\\$\\$\\$/something');
			util.escapePaths('/`path`/to/something').should.equal('/\\`path\\`/to/something');
			util.escapePaths('/path\\/to\\/something').should.equal('/path\\\\/to\\\\/something');
			util.escapePaths('/"path"/\'to\'/$`something` else').should.equal('/\\"path\\"/\\\'to\\\'/\\$\\`something\\`\\ else');
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

	describe('#isDirectory', function() {

		it('throws if given an argument other than string', function() {
			[123, function(){}, false, [], {}, undefined, null].forEach(function(arg) {
				(function() {
					util.isDirectory(arg);
				}).should.throw(/must be a string/);
			});
		});

		it('throws if given invalid path', function() {
			(function() {
				util.isDirectory(DUMMY);
			}).should.throw(RX_NO_SUCH_FILE);
		});

		it('returns false if given non-directory path', function() {
			util.isDirectory(__filename).should.be.false;
		});

		it('returns true if given directory path', function() {
			util.isDirectory(__dirname).should.be.true;
		});

	});

	describe('#sha1', function() {

		it('returns sha1 regardless of input', function() {
			[DUMMY, 123, false, undefined, null, function(){}, {foo:'bar'}, [1,2,3]].forEach(function(arg) {
				var ret = util.sha1(arg);
				ret.should.be.a.String;
				ret.length.should.equal(40);
			});
		});

	});

	describe('#writableHomeDirectory', function() {

		it('finds the home directory for the current system', function() {
			var homeDir = util.writableHomeDirectory();
			homeDir.should.be.a.String;
			fs.existsSync(homeDir).should.be.true;
			fs.statSync(homeDir).isDirectory().should.be.true;
		});

	});

});
