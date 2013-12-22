/**
 * Window specific code generation
 */
var Codegen = require('../codegen').Codegen,
	fs = require('fs'),
	_ = require('underscore'),
	wrench = require('wrench'),
	async = require('async'),
	path = require('path'),
	log = require('../log'),
	util = require('../util'),
	finder = require('./finder'),
	programs = require('./programs'),
	ilparser = require('./ilparser');

var TMP_CACHEFILE = path.join((process.env.TMPDIR || process.env.TEMP || '/tmp'), 'hyperloop_windows_metabase.json.gz'),
	TMP_CACHEFILE_TEST = path.join((process.env.TMPDIR || process.env.TEMP || '/tmp'), 'hyperloop_windows_metabase_test.json.gz');

function WinCodegen(options) {
	Codegen.call(this,options);
}

// extend our base class
WinCodegen.prototype.__proto__ = Codegen.prototype;

WinCodegen.prototype.generate = function(asts, generateASTCallback, callback) {
	var sources = this.sources,
		options = this.options;
	var cacheFile = process.env['HYPERLOOP_TEST'] ? TMP_CACHEFILE_TEST : TMP_CACHEFILE;
	if (cacheFile && fs.existsSync(cacheFile)) {
		var metabase = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
		return generateWithMetaBase(metabase, asts, sources, options, generateASTCallback, callback);
	}

	finder.find('Windows.winmd', function(ref) {
		programs.ildasm(ref, 'windows.il', function(ref) {
			ilparser.parseFile(ref, function(err, ast) {
				var metabase = ast.toJSON();
				util.writeIfDifferent(cacheFile, JSON.stringify(metabase, null, 2));
				generateWithMetaBase(metabase, asts, sources, options, generateASTCallback, callback);
			});
		});
	});
};

function generateWithMetaBase(metabase, asts, sources, options, generateASTCallback, callback) {
	var jsEngine,
		jsEngineName = 'jsc',
		jsEngineFile = path.join(__dirname, jsEngineName, 'codegen.js'),
		classes = metabase.classes,
		types = metabase.types,
		generate = { customclasses: {}, classes: {}, casts: {}, prefix: '', name: '' };

	// iterate over the ast to do some processing
	for (var i = 0; i < asts.length; i++) {
		var ast = asts[i],
			symbols = ast.sourcefile.symbols;
		for (var c = 0; c < symbols.length; c++) {
			var symbol = symbols[c];
			switch (symbol.type) {
				case 'compiler':
				case 'package':
				case 'method':
				case 'function':
					break;
				case 'symbol': {
					console.log('Symbol:',symbol);
					break;
				}
				case 'cast': {
					generate.casts[symbol.functionName] = symbol;
					break;
				}
				case 'class': {
					// new class
					//console.log('Class:',symbol);
					if (symbol.extendsName) {
						var extendsType = types[symbol.extendsName];
						if (!extendsType) {
							return callback(new Error("Couldn't find Class " + symbol.extendsName + " in " + symbol.node.start.file + " at " + symbol.node.start.line));
						}
						symbol.extendsType = classes[extendsType];
						var interfaces = symbol.interfaces;
						if (interfaces && interfaces.length) {
							for (var x = 0; x < interfaces.length; x++) {
								var interfaceName = interfaces[x],
									found = types[interfaceName];
								if (!found) {
									return callback(new Error("Couldn't find Class " + interfaceName + " in " + symbol.node.start.file + " at " + symbol.node.start.line));
								}
							}
						}
						var methods = symbol.methods;
						if (methods && methods.length) {
							for (var x = 0; x < methods.length; x++) {
								var methodName = methods[x];
								//TODO: check method argument types and returnType
							}
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
									return callback(new Error("couldn't resolve class:" + symbol.name + " in " + symbol.node.start.file + " at " + symbol.node.start.line));
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
								console.log('Unknown Symbol:', symbol.name, node);
								process.exit(1);
							}
							break;
						}
					}
					break;
				}
				default: {
					//console.log('Unhandled:', symbol);
					break;
				}
			}
		}
	}

	// generate compressed source
	var sourceResults = generateASTCallback(asts),
		tasks = [];
	// make sure we have a valid JS engine
	if (!fs.existsSync(jsEngineFile)) {
		return callback(new Error("Invalid option specified for --jsengine. Couldn't find engine named: " + jsEngineName.red) + " at " + jsEngineFile.yellow);
	}
	jsEngine = require(jsEngineFile);
	
	generate.dir = path.join('build', 'App');
	generate.gen_dir = path.join(generate.dir, 'Generated');
	generate.source = sourceResults[Object.keys(sourceResults)[0]];
	generate.name = 'GeneratedApp';
	wrench.mkdirSyncRecursive(generate.gen_dir);
	
	jsEngine.generateCode(generate, metabase, function(err, header, implementation, files) {
		if (err) {
			return callback(err);
		}
		util.writeIfDifferent(path.join('build', 'files.json'), JSON.stringify(files));
		util.writeIfDifferent(path.join(generate.dir, generate.prefix + generate.name + '.h'), header);
		util.writeIfDifferent(path.join(generate.dir, generate.prefix + generate.name + '.cpp'), implementation);
		callback();
	});
}

exports.Codegen = WinCodegen;