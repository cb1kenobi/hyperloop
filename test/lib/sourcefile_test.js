var SourceFile = require('../../lib/sourcefile').SourceFile,
	should = require('should'),
	_ = require('underscore');

var RX_BAD_ARGUMENT = /Bad argument/i,
	ARGS = [
		'filename',
		'name',
		{ opt1: 123, opt2: 'value' },
		[ 'arg1', 'arg2' ]
	];

function createSourceFile(args) {
	var inst = Object.create(SourceFile.prototype);
	inst = SourceFile.apply(inst, args || ARGS.slice(0)) || inst;
	return inst;
}

describe('lib/sourcefile.js', function() {

	describe('#SourceFile', function() {

		it('throws if no filename or name is given', function() {
			(function() {
				new SourceFile();
			}).should.throw(RX_BAD_ARGUMENT);

			(function() {
				new SourceFile('filename');
			}).should.throw(RX_BAD_ARGUMENT);
		});

		it('creates new instances of SourceFile', function() {
			var sf = createSourceFile();

			should.exist(sf);
			sf.filename.should.equal('/' + ARGS[0]);
			sf.name.should.equal(ARGS[1]);
			sf.options.should.equal(ARGS[2]);
			sf.args.should.equal(ARGS[3]);
			sf.symbols.should.eql([]);
			sf.commonClasses.should.eql([]);
			sf.dirname.should.equal('/');

			sf.parseImport.should.be.a.Function;
			sf.processCompiler.should.be.a.Function;
			sf.processNewClass.should.be.a.Function;
			sf.processCustomClass.should.be.a.Function;
			sf.processOwner.should.be.a.Function;
			sf.processMemory.should.be.a.Function;
			sf.isCommonClass.should.be.a.Function;
			sf.isGlobalClass.should.be.a.Function;
			sf.isGlobalFunction.should.be.a.Function;
			sf.processFunction.should.be.a.Function;
			sf.processMethod.should.be.a.Function;
			sf.processImport.should.be.a.Function;
			sf.processUnknown.should.be.a.Function;
			sf.processCommonClass.should.be.a.Function;
			sf.finish.should.be.a.Function;
			sf.isCacheable.should.be.a.Function;
			sf.fromJSON.should.be.a.Function;
			sf.toJSON.should.be.a.Function;
		});

		it('handles absolute paths for filename', function() {
			var args = ARGS.slice(0);
			args[0] = '/' + args[0];

			var sf = createSourceFile(args);
			sf.filename.should.equal(args[0]);
			sf.dirname.should.equal('/');
		});

		it('handles relative paths for filename', function() {
			var args = ARGS.slice(0);
			var filename = args[0];
			args[0] = './' + filename;

			var sf = createSourceFile(args);
			sf.filename.should.equal('/./' + filename);
			sf.dirname.should.equal('/');
		});

	});



});