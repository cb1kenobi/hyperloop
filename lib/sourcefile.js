/**
 * base class for SourceFile
 */
var _ = require('underscore'),
	path = require('path');

function SourceFile(filename, name) {
	if (!name) throw new Error('missing name for '+filename);
	this.filename = '/'+filename;
	if (/^\/\//.test(this.filename)) {
		this.filename = this.filename.substring(1);
	}
	this.name = name;
	this.dirname = '/' + path.dirname(this.filename);
	if (this.dirname==='/.') {
		this.dirname = '/';
	}
	if (/^\/\//.test(this.dirname)) {
		this.dirname = this.dirname.substring(1);
	}
	this.symbols = [];
};

/**
 * called to parse the `@import` statement is encountered
 */
SourceFile.prototype.parseImport = function(node, value) {
	throw new Error("required parseImport not implemented");
};

/**
 * called when a `@compiler` statement is encountered
 */
SourceFile.prototype.processCompiler = function(node, value) {
	this.symbols.push({type:'compiler',node:node,value:value,source:node.print_to_string()});
};

/**
 * called when a new class from a `@import` statement is constructed
 */
SourceFile.prototype.processNewClass = function(node, value) {
	this.symbols.push({type:'constructor',node:node,value:value,source:node.print_to_string()});
	return value;
};

/**
 * called when a new custom class from `@class` statement is constructed
 */
SourceFile.prototype.processCustomClass = function(node, className, extendsName, interfaces, methods, symbol) {
	this.symbols.push({type:'class',node:node,className:className,extendsName:extendsName,interfaces:interfaces,methods:methods,source:node.print_to_string(),symbol:symbol});
};

/**
 * called when a `@owner` statement is constructed
 */
SourceFile.prototype.processOwner = function(node, jsname, nativename) {
	this.symbols.push({type:'owner',node:node,jsname:jsname,nativename:nativename,source:node.print_to_string()});
};

/**
 * called when `@memory` statement is encountered to indicate that directory memory is used
 */
SourceFile.prototype.processMemory = function(node, value, nativename) {
	this.useJSBuffer = true;
	this.symbols.push({type:'memory',node:node,value:value,nativename:nativename,source:node.print_to_string()});
}

/**
 * called when a function is invoked using a `@import` statement symbol
 */
SourceFile.prototype.processFunction = function(node, value, args) {
	var found;
	for (var c=0;c<this.symbols.length;c++) {
		if (this.symbols[c].value===value) {
			found = this.symbols[c];
			break;
		}
	}

	if (found) {
		this.symbols.push({type:'function',node:node,value:value,args:args,source:node.print_to_string(),symbol:found});
	}
	return value;
};

/**
 * called when a method of a `@class` is called
 */
SourceFile.prototype.processMethod = function(node, property, method, args) {
	this.symbols.push({
		type: 'method',
		node: node,
		property: property,
		method: method,
		args: args,
		source: node.print_to_string()
	});
};

/**
 * called when an `@import` statement is encountered
 */
SourceFile.prototype.processImport = function(node, value) {
	var results = this.parseImport(node,value),
		self = this;

	results.forEach(function(result){
		var entry = _.extend(result,{node:node,source:node.print_to_string()});
		self.symbols.push(entry);
	});
};

/**
 * called after processing the JS AST with the JS source code to be generated
 */
SourceFile.prototype.finish = function(jsSource) {
	this.jsSource = jsSource;
};

/**
 * implementations should override to determine if the generated files are cacheable -
 * typically by checking for the existence of the generated files in the destination directory
 */
SourceFile.prototype.isCacheable = function() {
	return false;
}

/**
 * return a new object from a serialized object
 */
SourceFile.prototype.fromJSON = function (obj) {
	var sf = new (require(obj.classname).SourceFile)(obj.filename,obj.name);
	sf.symbols = obj.symbols;
	sf.jsSource = obj.jsSource;
	return sf;
}

/**
 * return a JSON representation of this object
 */
SourceFile.prototype.toJSON = function() {
	var obj = {
		filename: this.filename,
		name: this.name,
		symbols: [],
		jsSource: this.jsSource,
		classname: this.classname
	},
	self = this;

	// we eliminate the node references which is a circular reference

	this.symbols.forEach(function(sym){
		var node = _.omit(sym,'node','symbol');
		obj.symbols.push(node);
	});

	return obj;
};

exports.SourceFile = SourceFile;
