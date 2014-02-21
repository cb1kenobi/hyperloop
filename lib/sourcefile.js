/**
 * base class for SourceFile
 */
var _ = require('underscore'),
	path = require('path'),
	fs = require('fs'),
	Uglify = require('uglify-js');

function SourceFile(filename, name, options, args) {
	if (!name || !filename) {
		throw new Error('Bad arguments. Must give filename and name for SourceFile.');
	}
	this.filename = '/'+filename;
	if (/^\/\//.test(this.filename)) {
		this.filename = this.filename.substring(1);
	}
	this.name = name;
	this.dirname = '/' + path.dirname(this.filename);
	if (/^\/\//.test(this.dirname)) {
		this.dirname = this.dirname.substring(1);
	}
	if (this.dirname==='/.') {
		this.dirname = '/';
	}
	this.symbols = [];
	this.commonClasses = [];
	this.options = options;	// command line options
	this.args = args;		// command line args
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
	this.symbols.push({
		type:'compiler',
		node:node,
		value:value,
		source:node.print_to_string()
	});
};

/**
 * called when a new class from a `@import` statement is constructed
 */
SourceFile.prototype.processNewClass = function(node, value) {
	this.symbols.push({
		type:'constructor',
		node:node,
		value:value,
		source:node.print_to_string()
	});
	return value;
};

/**
 * called when a new custom class from `@class` statement is constructed
 */
SourceFile.prototype.processCustomClass = function(node, className, extendsName, interfaces, methods, symbol) {
	this.symbols.push({
		type:'class',
		node:node,
		className:className,
		extendsName:extendsName,
		interfaces:interfaces,
		methods:methods,
		source:node.print_to_string(),
		symbol:symbol
	});
};

/**
 * called when `@memory` statement is encountered to indicate that directory memory is used
 */
SourceFile.prototype.processMemory = function(node, value, nativename) {
	this.useJSBuffer = true;
	this.symbols.push({
		type:'memory',
		node:node,
		value:value,
		nativename:nativename,
		source:node.print_to_string()
	});
};

/**
 * called when `@cast` statement is encountered to indicate that an object cast is used
 */
SourceFile.prototype.processCast = function(node, argType, argObject, functionName) {
	this.useJSCast = true;
	this.symbols.push({
		type: 'cast',
		node: node,
		argType: argType,
		argObject: argObject,
		functionName: functionName
	});
};

/**
 * called when `@generic` statement is encountered to indicate that an object generic fetch is used
 */
SourceFile.prototype.processGeneric = function(node, args, type, mangledName) {
	this.symbols.push({
		type: 'generic',
		node: node,
		args: args,
		targetType: type,
		functionName: mangledName
	});
};

/**
 * global functions and objects that are always available in the VM
 */
var GlobalFunctions = ['require','parseInt','parseFloat','eval','setTimeout','clearTimeout','setInterval','clearInterval','this','super','String','Number','__dirname','__filename','undefined','arguments'],
	GlobalObjects = ['Object','RegExp','Math','Date','Number','String','Array','Boolean','Function','Error','JSON','console','module','exports','super','this','global'],
	TitaniumFunctions = ['alert'],
	TitaniumObjects = ['Titanium','Ti'],
	CommonObjects = fs.readdirSync(path.join(__dirname,'..','lib','common','js')).map(function(n){return n.replace(/\.js$/,'')});

/**
 * returns true if the value is a Common class
 */
SourceFile.prototype.isCommonClass = function(value) {
	return CommonObjects.indexOf(value)!==-1;
};

/**
 * returns true if value is a global Class
 */
SourceFile.prototype.isGlobalClass = function(value) {
	return GlobalObjects.indexOf(value)!==-1 || (this.options.ticurrent && TitaniumObjects.indexOf(value)!==-1) || this.isCommonClass(value);
};

/**
 * returns true if value is a global Function
 */
SourceFile.prototype.isGlobalFunction = function(value) {
	return GlobalFunctions.indexOf(value)!==-1 || (this.options.ticurrent && TitaniumFunctions.indexOf(value)!==-1);
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
		this.symbols.push({
			type:'function',
			node:node,
			value:value,
			args:args,
			source:node.print_to_string(),
			symbol:found
		});
	}
	else {
		if (!this.isGlobalFunction(value) && this._symbols.indexOf(value)===-1) {
			this.processUnknown(node,'function',value,args);
		}
	}
	return value;
};

/**
 * called when a method of a `@class` is called
 */
SourceFile.prototype.processMethod = function(node, property, method, args) {

	if (!this.isGlobalClass(property) && this._symbols.indexOf(property)===-1) {

		var valid = false;

		// lookup the variable in the scope
		if (node.expression) {
			var expression = node.expression;
			// we need to walk the scope chain
			while (expression) {
				var found = expression.scope && expression.scope.find_variable && expression.scope.find_variable(property);
				if (found) {
					valid = true;
					break;
				}
				expression = expression.expression;
			}
		}

		if (!valid) {
			return this.processUnknown(node,'method',method,args,property);
		}
	}

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
 * called when an ambigious / unknown symbol is defined
 */
SourceFile.prototype.processUnknown = function(node, type, name, args, property) {

	// make sure this isn't one of our globals
	if (this.isGlobalClass(name) || this.isGlobalFunction(name)) {
		return;
	}

	// if this global object funciton
	if (this.isGlobalClass(property) && type==='method') {
		return;
	}

	this.symbols.push({
		type: 'unknown',
		node: node,
		metatype: type,
		name: name,
		args: args,
		property: property,
		source: node.print_to_string()
	});
};

/**
 * called to process common classes
 */
SourceFile.prototype.processCommonClass = function(node, name) {
	if (this.commonClasses.indexOf(name)===-1) {
		if (/^(Float|Int|Uint)(8|16|32|64)(Clamped)?Array$/.test(name)) {
			// these are dependencies that we need to include
			this.processCommonClass(node,'ArrayBuffer');
			this.processCommonClass(node,'ArrayBufferView');
			this.processCommonClass(node,'DataView');
			this.useJSBuffer = true; // we depend on JSBuffer
			this.useArrayBuffer = true;
		}
		this.commonClasses.push(name);
	}
};

/**
 * called to indicate we have a try
 */
SourceFile.prototype.processTry = function(node) {
};

/**
 * called to indicate we have a catch
 */
SourceFile.prototype.processCatch = function(node) {
};

/**
 * called when a node is mutated and we need to set the symbol
 */
SourceFile.prototype.updateLastNode = function(node) {
	var sym = this.symbols[this.symbols.length-1];
	if (sym) {
		sym.node = node;
	}
};

/**
 * called after processing the JS AST with the JS source code to be generated
 */
SourceFile.prototype.finish = function(jsSource) {
	this.jsSource = jsSource;
};

/**
 * called after AST parsing
 */
SourceFile.prototype.processTransformCompleted = function() {
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
	};

	// we eliminate the node references which is a circular reference

	this.symbols.forEach(function(sym){
		var node = _.omit(sym,'node','symbol');
		obj.symbols.push(node);
	});

	return obj;
};

exports.SourceFile = SourceFile;
