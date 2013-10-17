/**
 * Window specific code generation
 */
var Codegen = require('../codegen').Codegen,
	fs = require('fs'),
	path = require('path');

function WinCodegen(options) {
	Codegen.call(this,options);
};

// extend our base class
WinCodegen.prototype.__proto__ = Codegen.prototype;

WinCodegen.prototype.generate = function(asts,generateASTCallback,callback) {

	return callback();



	//FIXME: for testing
	var mf = path.join(__dirname, '..','..','windows.json'),
		metabase = JSON.parse(fs.readFileSync(mf).toString()),
		classes = metabase.classes,
		types = metabase.types,
		generate = {
			classes: {},
			customclasses: {}
		};

	for (var i=0;i<asts.length;i++) {
		var ast = asts[i],
			symbols = ast.sourcefile.symbols;
		for (var c=0;c<symbols.length;c++) {
			var symbol = symbols[c];
			switch (symbol.type) {
				case 'compiler': {
					break;
				}
				case 'package': {
					break;
				}
				case 'method': {
					break;
				}
				case 'function': {
					break;
				}
				case 'symbol': {
					console.log('symbol',symbol);
					break;
				}
				case 'class': {
					// new class
					console.log('class',symbol);
					var extendsType = types[symbol.extendsName];
					if (!extendsType) {
						return callback(new Error("Couldn't find Class "+symbol.extendsName+" in "+symbol.node.start.file+" at "+symbol.node.start.line));
					}
					symbol.extendsType = classes[extendsType];
					var interfaces = symbol.interfaces;
					if (interfaces && interfaces.length) {
						for (var x=0;x<interfaces.length;x++) {
							var interfaceName = interfaces[x],
								found = types[interfaceName];
							if (!found) {
								return callback(new Error("Couldn't find Class "+interfaceName+" in "+symbol.node.start.file+" at "+symbol.node.start.line));
							}
						}
					}
					var methods = symbol.methods;
					if (methods && methods.length) {
						for (var x=0;x<methods.length;x++) {
							var methodName = methods[x];
							//TODO: check method argument types and returnType
						}
					}
					generate.customclasses[symbol.className] = symbol;
					break;
				}
				case 'unknown': {
					switch (symbol.metatype) {
						case 'new': {
							var type = generate.classes[symbol.name];
							if (!type) {
								// check for fully qualified classname
								var entry = classes[symbol.name];
								if (entry) {
									var tok = symbol.name.split('.'),
										name = tok[tok.length];
									type = name;
								}
								else {
									return callback(new Error("couldn't resolve class:"+symbol.name+" in "+symbol.node.start.file+" at "+symbol.node.start.line));
								}
							}
							//TODO: this is a new Class
							break;
						}
						case 'symbol': {
							if (symbol.name in types) {
								// found a class
								symbol.classname = types[symbol.name];
								symbol.object = classes[symbol.classname];
								symbol.type = 'class';
								generate.classes[symbol.name] = symbol;
							}
							else {
								// unknown symbol
								var node = symbol.node;
								console.log(symbol.name,node);
								process.exit(1);
							}
							break;
						}
					}
					break;
				}
				default: {
					console.log(symbol);
					break;
				}
			}
		}
	}


	console.log(generate)

	//var sourceResults = generateASTCallback(asts);


	callback();
};

exports.Codegen = WinCodegen;
