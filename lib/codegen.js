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

Codegen.prototype.generate = function(asts,generateASTs,callback) {
	// abstract, must be implemented
	throw new Error('not implemented');
}

exports.Codegen = Codegen;