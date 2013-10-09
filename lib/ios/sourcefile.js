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
 * global objects and functions that are always available in the VM
 */
var GlobalObjects = ['Object','RegExp','Math','Date','Number','String','Array','Boolean','Function','Error','JSON','console','this','super'],
	GlobalFunctions = ['require','parseInt','parseFloat','eval','setTimeout','setInterval','this','super'];

/**
 * called when a function is invoked using a `@import` statement symbol
 */
iOSSourceFile.prototype.processFunction = function(node, value, args) {
	if (GlobalFunctions.indexOf(value)===-1 && this._symbols.indexOf(value)===-1) {
		throw new Error("Function `"+value+"` not found in scope at "+node.start.file+" on "+node.start.line+":"+node.start.col);
	}
	return SourceFile.prototype.processFunction.call(this,node,value,args);
}

/**
 * called when a new custom class from `@class` statement is constructed
 */
iOSSourceFile.prototype.processCustomClass = function(node, className, extendsName, interfaces, methods, symbol) {
	this._symbols.indexOf(className)===-1 && this._symbols.push(className);
	return SourceFile.prototype.processCustomClass.call(this,node, className, extendsName, interfaces, methods, symbol);
}

/**
 * called when a method of a `@class` is called
 */
iOSSourceFile.prototype.processMethod = function(node, property, method, args) {
	if (GlobalObjects.indexOf(property)===-1 && this._symbols.indexOf(property)===-1) {

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
			throw new Error("Symbol `"+property+"` not found at "+node.start.file+" on "+node.start.line+":"+node.start.col);
		}
	}
	return SourceFile.prototype.processMethod.call(this,node,property,method,args);
};

exports.SourceFile = iOSSourceFile;
