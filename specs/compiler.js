/**
 * compiler test case
 */
var should = require('should'),
    path = require('path'),
    compiler = require(path.join(__dirname,'..','lib','compiler.js')),
    sf = path.join(__dirname,'..','lib','sourcefile.js'),
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
			code = ast.print_to_string({beautify:true});
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
		sourcefile.symbols[1].source.should.be.eql('hyperloop_import("UIKit/UIButton")');
	});

});
