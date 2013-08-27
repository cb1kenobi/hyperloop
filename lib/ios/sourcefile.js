/**
 * iOS implementation of SourceFile
 */
var SourceFile = require('../sourcefile').SourceFile,
	path = require('path'),
	fs = require('fs');

function iOSSourceFile(filename, name) {	
	SourceFile.call(this, filename, name);
	this.classname = path.join(__dirname,'sourcefile.js');
};

iOSSourceFile.prototype.__proto__ = SourceFile.prototype;

iOSSourceFile.prototype.isCacheable = function(srcdir) {
	return fs.existsSync(this.generateFilename(srcdir));
}

iOSSourceFile.prototype.generateFilename = function(srcdir) {
	return path.join(srcdir, this.name+'.m');
}

/**
 * called to parse the `import` statement is encountered
 */
iOSSourceFile.prototype.parseImport = function(node, value) {
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

exports.SourceFile = iOSSourceFile;
