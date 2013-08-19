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

exports.SourceFile = iOSSourceFile;
