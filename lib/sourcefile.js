/**
 * base class for SourceFile
 */
var _ = require('underscore');

function SourceFile(filename, name) {	
	this.filename = filename;
	this.symbols = [];
	this.name = name;
	this.classes = {};
	this.statics = {};
};

/**
 * called when a `package` statement is encountered
 */
SourceFile.prototype.processPackage = function(node, value) {
	this.symbols.push({type:'package',node:node,value:value,source:node.print_to_string()});
};

/**
 * called when a `class` statement is encountered
 */
SourceFile.prototype.processClass = function(node, value) {
	var obj = {type:'class',node:node,value:value,source:node.print_to_string()};
	this.classes[value]=obj;
	this.symbols.push(obj);
};

/**
 * called when a `static` statement is encountered
 */
SourceFile.prototype.processStatic = function(node, value) {
	var obj = {type:'static',node:node,value:value,source:node.print_to_string()};
	this.statics[value]=obj;
	this.symbols.push(obj);
};

/**
 * called when a `native` statement is encountered
 */
SourceFile.prototype.processNative = function(node, value) {
	this.symbols.push({type:'native',node:node,value:value,source:node.print_to_string()});
};

/**
 * called when a new class from a `class` statement is constructed
 */
SourceFile.prototype.processNewClass = function(node, value) {
	if (this.classes[value]) {
		this.symbols.push({type:'constructor',node:node,value:value,source:node.print_to_string()});
		return value+'$Class';
	}
	else {
		throw new Error("Couldn't find class: "+value.magenta.underline+" in "+node.start.file+" on "+node.start.line+":"+node.start.col);
	}
};

/**
 * called when a function is invoked using a `static` statement symbol
 */
SourceFile.prototype.processFunction = function(node, value, args) {
	var f = this.statics[value];
	if (f) {
		this.symbols.push({type:'function',node:node,value:value,args:args,source:node.print_to_string()});
		return value;
	}
	else {
		throw new Error("Couldn't find function: "+value.magenta.underline+" in "+node.start.file+" on "+node.start.line+":"+node.start.col);
	}
};

/**
 * called when an `import` statement is encountered
 */
SourceFile.prototype.processImport = function(node, value) {
	this.symbols.push({type:'import',node:node,value:value,source:node.print_to_string()});
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
	var sf = new (require(obj.classname).SourceFile)(obj.filename);
	sf.symbols = obj.symbols;
	sf.classes = obj.classes;
	sf.statics = obj.statics;
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
		classes: {},
		statics: {},
		jsSource: this.jsSource,
		classname: this.classname
	},
	self = this;

	// we eliminate the node references which is a circular reference

	this.symbols.forEach(function(sym){
		var node = _.omit(sym,'node');
		obj.symbols.push(node);
	});

	Object.keys(this.statics).forEach(function(name){
		var sym = self.statics[name]; 
		obj.statics[name] = _.omit(sym,'node');
	});

	Object.keys(this.classes).forEach(function(name){
		var sym = self.classes[name]; 
		obj.classes[name] = _.omit(sym,'node');
	});

	return obj;
};

exports.SourceFile = SourceFile;

