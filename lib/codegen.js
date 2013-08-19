/**
 * base class for Codegen
 */

function Codegen(options) {
	this.sources = [];
	this.options = options;
}

Codegen.prototype.addSource = function(source) {
	this.sources.push(source);
}

Codegen.prototype.generate = function(callback) {
}

Codegen.prototype.setFileCache = function(value) {
	this.fileCache = value;
}

exports.Codegen = Codegen;