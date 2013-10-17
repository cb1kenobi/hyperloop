/**
 * Windows implementation of SourceFile
 */
var SourceFile = require('../sourcefile').SourceFile,
	path = require('path'),
	fs = require('fs');

function WinSourceFile(filename, name) {
	SourceFile.call(this, filename, name);
	this.classname = path.join(__dirname,'sourcefile.js');
	this._symbols = [];
};

WinSourceFile.prototype.__proto__ = SourceFile.prototype;

WinSourceFile.prototype.isCacheable = function(srcdir) {
	return fs.existsSync(this.generateFilename(srcdir));
}

WinSourceFile.prototype.generateFilename = function(srcdir) {
	return path.join(srcdir, this.name+'.cpp');
}

/**
 * called to parse the `@import` statement is encountered
 */
WinSourceFile.prototype.parseImport = function(node, value) {
	var result = {type:'package',value:value};
	this._symbols.push(result);
	return [result];
};

/**
 * called when a new custom class from `@class` statement is constructed
 */
WinSourceFile.prototype.processCustomClass = function(node, className, extendsName, interfaces, methods, symbol) {
	this._symbols.indexOf(className)===-1 && this._symbols.push(className);
	return SourceFile.prototype.processCustomClass.call(this,node, className, extendsName, interfaces, methods, symbol);
}


exports.SourceFile = WinSourceFile;
