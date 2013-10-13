/**
 * iOS implementation of SourceFile
 */
var SourceFile = require('../sourcefile').SourceFile,
	path = require('path'),
	fs = require('fs');

function iOSSourceFile(filename, name) {
	SourceFile.call(this, filename, name);
	this.classname = path.join(__dirname,'sourcefile.js');
	this._symbols = [];
};

iOSSourceFile.prototype.__proto__ = SourceFile.prototype;

iOSSourceFile.prototype.isCacheable = function(srcdir) {
	return fs.existsSync(this.generateFilename(srcdir));
}

iOSSourceFile.prototype.generateFilename = function(srcdir) {
	return path.join(srcdir, this.name+'.m');
}

/**
 * called to parse the `@import` statement is encountered
 */
iOSSourceFile.prototype.parseImport = function(node, value) {
	var tok = value.split('/');
	if (tok.length >= 2) {
		var results = [];
		results[0] = {type:'package',value:tok[0], path:tok.slice(1).join("/")};
		results[1] = {type:'symbol', value:tok.slice(1).join("/"), framework: tok[0]};
		this._symbols.indexOf(tok[1])===-1 && this._symbols.push(tok[1]);
		this._symbols.indexOf(tok[0])===-1 && this._symbols.push(tok[0]);
		return results;
	}
	else if (tok.length===1) {
		this._symbols.indexOf(tok[0])===-1 && this._symbols.push(tok[0]);
		return [{type:'symbol',value:tok[0]}];
	}
	else {
		throw new Error("Invalid import `"+value+"` at "+node.start.file+" on "+node.start.line+":"+node.start.col);
	}
};

/**
 * called when a new custom class from `@class` statement is constructed
 */
iOSSourceFile.prototype.processCustomClass = function(node, className, extendsName, interfaces, methods, symbol) {
	this._symbols.indexOf(className)===-1 && this._symbols.push(className);
	return SourceFile.prototype.processCustomClass.call(this,node, className, extendsName, interfaces, methods, symbol);
}


exports.SourceFile = iOSSourceFile;
