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

function WinCodegen(options) {
	Codegen.call(this, options);
}

// extend our base class
WinCodegen.prototype.__proto__ = Codegen.prototype;

WinCodegen.prototype.generate = function(asts, generateASTCallback, callback) {
	var sources = this.sources,
		options = this.options,
		isTest = process.env['HYPERLOOP_TEST'],
		cacheDir = process.env.TMPDIR || process.env.TEMP || '/tmp',
		cacheFile = path.join(cacheDir, 'hyperloop_windows_metabase' + (isTest ? '.test.' : '.') + options.sdk + '.json.gz');

	if (cacheFile && fs.existsSync(cacheFile)) {
		var metabase = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
		return generateWithMetaBase(metabase, asts, sources, options, generateASTCallback, callback);
	}

	finder.find('Windows.winmd', options.sdk, function(ref) {
		if (!ref) {
			log.error('Failed to find Windows.winmd.');
			log.fatal('Please create an issue at https://github.com/appcelerator/hyperloop/issues/new.');
		}
		programs.ildasm(ref, 'windows.il', function(err, ref) {
			if (err) {
				log.error('Failed to ildasm the windows.winmd: ildasm.exe failed.');
				log.fatal(err);
			}
			ilparser.parseFile(ref, function(err, ast) {
				if (err) {
					log.error('Failed to parse the output from ildasm.');
					log.fatal(err);
				}
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
		generate = { customclasses: {}, classes: {}, casts: {}, prefix: '', name: '', memory: {} };

	// iterate over the ast to do some processing
	for (var i = 0; i < asts.length; i++) {
		var ast = asts[i],
			symbols = ast.sourcefile.symbols;
		for (var c = 0; c < symbols.length; c++) {
			var symbol = symbols[c];
			switch (symbol.type) {
				case 'compiler':
					generate.App = symbol.value.App;
					break;
				case 'package':
				case 'method':
				case 'function':
					break;
				case 'symbol':
				{
					console.log('Symbol:', symbol);
					break;
				}
				case 'cast':
				{
					generate.casts[symbol.functionName] = symbol;
					break;
				}
				case 'memory':
				{
					if (isArray(symbol.value)) {
						var lengths = [],
							array = makeArray(symbol.value, lengths);
						var subscript = '[' + lengths.join('][') + ']';

						symbol.assign = symbol.nativename;
						symbol.code = 'float ' + symbol.nativename + '$ ' + subscript + ' = ' + array + ';';
						symbol.code += '\nfloat *' + symbol.nativename + ' = (float *)malloc(sizeof(' + symbol.nativename + '$));';
						symbol.code += '\nmemcpy(' + symbol.nativename + ',&' + symbol.nativename + '$,sizeof(' + symbol.nativename + '$));';
						symbol.length = 'sizeof(' + symbol.nativename + '$)';
					}
					else {
						if (symbol.value === null) {
							symbol.code = 'float *' + symbol.nativename + ' = (float *)malloc(sizeof(float) * 1);\n';
							// initialize to NAN
							symbol.code += symbol.nativename + '[0] = NAN;';
							symbol.length = 'sizeof(float)*1';
						}
						else {
							symbol.code = 'void *' + symbol.nativename + ' = (void *)malloc(' + symbol.value + ');\n';
							// initialize to NAN
							symbol.code += '((float*)' + symbol.nativename + ')[0] = NAN;';
							symbol.length = symbol.value;
						}
						symbol.assign = symbol.nativename;
					}
					generate.memory[symbol.nativename] = symbol;
					break;
				}
				case 'class':
				{
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
				case 'unknown':
				{
					switch (symbol.metatype) {
						case 'new':
						{
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
									log.fatal("couldn't resolve class: " + symbol.name + " in " + (!symbol.node.start ? 'unknown' : (symbol.node.start.file + " at " + symbol.node.start.line)));
								}
							}
							//TODO: this is a new Class
							break;
						}
						case 'symbol':
						{
							if (symbol.name in types) {
								// found a class
								symbol.classname = types[symbol.name];
								symbol.object = classes[symbol.classname];
								symbol.type = 'class';
								generate.classes[symbol.name] = symbol;
							}
							else {
								var generic = findGenerics(symbol.name, types);
								if (generic) {
									symbol.classname = generic;
									symbol.object = classes[symbol.classname];
									symbol.type = 'class';
									generate.classes[symbol.name] = symbol;
								}
								else {
									// unknown symbol
									log.fatal('Unknown Symbol:', symbol.name, symbol.node);
								}
							}
							break;
						}
					}
					break;
				}
				default:
				{
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

	jsEngine.generateCode(generate, metabase, function(err, header, implementation, config) {
		if (err) {
			return callback(err);
		}
		util.writeIfDifferent(path.join('build', 'config.json'), JSON.stringify(config, undefined, 4));
		util.writeIfDifferent(path.join(generate.dir, generate.prefix + generate.name + '.h'), header);
		util.writeIfDifferent(path.join(generate.dir, generate.prefix + generate.name + '.cpp'), implementation);
		callback();
	});
}

exports.Codegen = WinCodegen;

function isArray(value) {
	return value && value.constructor.name === Array.prototype.constructor.name;
}

function makeArray(value, lengths) {
	lengths && lengths.push(value.length);
	var array = [];
	for (var c = 0; c < value.length; c++) {
		var entry = value[c];
		if (isArray(entry)) {
			entry = makeArray(entry, c === 0 ? lengths : null);
		}
		array.push(entry);
	}
	return '{' + array.join(', ') + '}';
}

function findGenerics(name, types) {
	var regex = new RegExp('^' + name + '`[12]<[^>]+>$');
	for (var key in types) {
		if (types.hasOwnProperty(key)) {
			if (regex.test(key)) {
				return types[key];
			}
		}
	}
	return null;
}