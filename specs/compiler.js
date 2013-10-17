/**
 * compiler test case
 */
var should = require('should'),
    path = require('path'),
    compiler = require('../lib/compiler'),
    sf = path.join(__dirname,'..','lib','sourcefile.js'),
    Uglify = require('uglify-js'),
    SourceFile = require(sf).SourceFile;

function MockSourceFile() {
	SourceFile.call(this, 'test', 'test');
	this.classname = sf;
}

MockSourceFile.prototype.__proto__ = SourceFile.prototype;

MockSourceFile.prototype.parseImport = function(node, value) {
	var tok = value.split('/');
	if (tok.length === 2) {
		var results = [];
		results[0] = {type:'package',value:tok[0]};
		results[1] = {type:'symbol', value:tok[1], framework: tok[0]};
		return results;
	}
	else {
		throw new Error("Invalid import `"+value+"` at "+node.start.file+" on "+node.start.line+":"+node.start.col);
	}
};

function toJS(obj){
	var source = '('+JSON.stringify(obj)+')',
    	ast = Uglify.parse(source,{
        	filename:'<source>'
    	}),
    	code = ast.print_to_string({ beautify: 0 });
    return code.substring(0,code.length-1); // remove semicolon
}

describe("compiler", function() {


	it("should exist", function() {
		should.exist(compiler);
		should.exist(compiler.compile);
		should.exist(compiler.compress);
	});

	it("should transform simple @import", function() {
		var source = "@import('UIKit/UIButton')",
			sourcefile = new MockSourceFile(),
			ast = compiler.compile(source, 'test', sourcefile),
			code = compiler.compress(ast,{},'test');
		code.should.be.empty;
		sourcefile.name.should.be.eql('test');
		sourcefile.filename.should.be.eql('/test');
		sourcefile.dirname.should.be.eql('/');
		sourcefile.symbols.should.not.be.empty;
		sourcefile.symbols.should.have.length(2);
		sourcefile.symbols[0].should.have.property('type');
		sourcefile.symbols[1].should.have.property('type');
		sourcefile.symbols[0].should.have.property('value');
		sourcefile.symbols[1].should.have.property('value');
		sourcefile.symbols[0].should.have.property('node');
		sourcefile.symbols[1].should.have.property('node');
		sourcefile.symbols[0].should.have.property('source');
		sourcefile.symbols[1].should.have.property('source');
		sourcefile.symbols[1].source.should.be.eql('@import("UIKit/UIButton")');
		sourcefile.symbols[0].type.should.be.eql('package');
		sourcefile.symbols[1].type.should.be.eql('symbol');
		sourcefile.symbols[0].value.should.be.eql('UIKit');
		sourcefile.symbols[1].value.should.be.eql('UIButton');
		sourcefile.symbols[1].should.have.property('framework');
		sourcefile.symbols[1].framework.should.be.eql('UIKit');
	});

	it("should transform simple @compiler", function() {
		var source = "@compiler({})",
			sourcefile = new MockSourceFile(),
			ast = compiler.compile(source, 'test', sourcefile),
			code = compiler.compress(ast,{},'test');
		code.should.be.empty;
		sourcefile.name.should.be.eql('test');
		sourcefile.filename.should.be.eql('/test');
		sourcefile.dirname.should.be.eql('/');
		sourcefile.symbols.should.not.be.empty;
		sourcefile.symbols.should.have.length(1);
		sourcefile.symbols[0].should.have.property('type');
		sourcefile.symbols[0].should.have.property('value');
		sourcefile.symbols[0].type.should.be.eql('compiler');
		sourcefile.symbols[0].value.should.be.eql({});
		sourcefile.symbols[0].source.should.be.eql('@compiler({})');
	});

	it("should transform complex @compiler", function() {
		var obj = {cflags:{'-DDEBUG':1}},
			source = "@compiler(" + JSON.stringify(obj) + ")",
			sourcefile = new MockSourceFile(),
			ast = compiler.compile(source, 'test', sourcefile),
			code = compiler.compress(ast,{},'test');
		sourcefile.name.should.be.eql('test');
		sourcefile.filename.should.be.eql('/test');
		sourcefile.dirname.should.be.eql('/');
		sourcefile.symbols.should.not.be.empty;
		sourcefile.symbols.should.have.length(1);
		sourcefile.symbols[0].should.have.property('type');
		sourcefile.symbols[0].should.have.property('value');
		sourcefile.symbols[0].type.should.be.eql('compiler');
		sourcefile.symbols[0].source.should.be.eql('@compiler'+toJS(obj));
	});

	it("should transform @memory with number", function() {
		var source = "var mem=@memory(1024);",
			sourcefile = new MockSourceFile(),
			ast = compiler.compile(source, 'test', sourcefile),
			code = compiler.compress(ast,{},'test');
		code.should.eql('var mem=JSBuffer0;');
		sourcefile.name.should.be.eql('test');
		sourcefile.filename.should.be.eql('/test');
		sourcefile.dirname.should.be.eql('/');
	});

	it("should transform @memory with no params", function() {
		var source = "var mem=@memory();",
			sourcefile = new MockSourceFile(),
			ast = compiler.compile(source, 'test', sourcefile),
			code = compiler.compress(ast,{},'test');
		code.should.eql('var mem=JSBuffer1;');
		sourcefile.name.should.be.eql('test');
		sourcefile.filename.should.be.eql('/test');
		sourcefile.dirname.should.be.eql('/');
	});

	it("should throw when @memory gets bad params", function() {
		(function() {
			var source = "var mem=@memory('badvalue');",
				sourcefile = new MockSourceFile(),
				ast = compiler.compile(source, 'test', sourcefile);
		}).should.throw(/Invalid/);
	});

	it("should transform simple @owner", function() {
		var source = "var obj1,obj2;@owner(obj1,obj2);",
			sourcefile = new MockSourceFile(),
			ast = compiler.compile(source, 'test', sourcefile),
			code = compiler.compress(ast,{},'test');
		code.should.eql('var obj1,obj2;HL$TrackOwner(obj1,obj2);');
		sourcefile.name.should.be.eql('test');
		sourcefile.filename.should.be.eql('/test');
		sourcefile.dirname.should.be.eql('/');
	});

	it.skip("should transform simple @class", function() {
		var source = "@import('UIKit/UIButton'); var Class = @class(UIButton,[Foo],{callback:function(){}})",
			sourcefile = new MockSourceFile(),
			ast = compiler.compile(source, 'test', sourcefile),
			code = compiler.compress(ast,{},'test');
		sourcefile.name.should.be.eql('test');
		sourcefile.filename.should.be.eql('/test');
		sourcefile.dirname.should.be.eql('/');
		console.log(sourcefile)
		sourcefile.symbols.should.not.be.empty;
		sourcefile.symbols.should.have.length(3);
		sourcefile.symbols[0].should.have.property('type');
		sourcefile.symbols[0].should.have.property('value');
		sourcefile.symbols[0].type.should.be.eql('package');
	});

});
