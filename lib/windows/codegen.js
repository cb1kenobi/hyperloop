/**
 * Window specific code generation
 */
var Codegen = require('../codegen').Codegen,
	fs = require('fs'),
	_ = require('underscore'),
	wrench = require('wrench'),
	path = require('path'),
	crypto = require('crypto'),
	log = require('../log'),
	util = require('../util'),
	finder = require('./finder'),
	programs = require('./programs'),
	ilparser = require('./ilparser'),
	hparser = require('./hparser');

var keywordMatcher = /[A-Z_0-9]+/ig;

function WinCodegen(options) {
	Codegen.call(this, options);
}

// extend our base class
WinCodegen.prototype.__proto__ = Codegen.prototype;

WinCodegen.prototype.generate = function(asts, generateASTCallback, callback) {
	log.info('Beginning code generation...');

	var options = this.options,
		isTest = process.env['HYPERLOOP_TEST'],
		cacheDir = process.env.TMPDIR || process.env.TEMP || '/tmp',
		parsedChecksum = crypto.createHash('sha1').update(
			options.sdk
				+ (isTest ? 'test' : 'not-test')
				+ fs.readFileSync(path.join(__dirname, 'ilparser.js'), 'utf8')
		).digest('hex'),
		cacheFile = path.join(cacheDir, 'hyperloop_windows_metabase.' + parsedChecksum + '.json.gz');

	if (cacheFile && fs.existsSync(cacheFile)) {
		var metabase = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
		return generateImports(options, metabase, callback);
	}

	var ref = finder.find('Windows.winmd', options.sdk);
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
			generateImports(options, metabase, callback);
		});
	});

	function generateImports(options, metabase, callback) {
		var left = asts.length;

		function done() {
			left -= 1;
			if (left === 0) {
				generateDocumentationWithMetaBase(metabase, callback);
			}
		}

		for (var i = 0, iL = asts.length; i < iL; i++) {
			var imports = asts[i].sourcefile._symbols.map(function(i) {
				return i.value;
			}).filter(removeFalsy);
			if (imports.length === 0) {
				done();
			}
			else {
				hparser.run(options, imports, asts[i].sourcefile, done);
			}
		}
	}

	function generateDocumentationWithMetaBase(metabase, callback) {
		if (!options.document) {
			return generateWithMetaBase(metabase, callback);
		}
		var dir = path.join(options.dest, 'documentation'),
			typeDir = path.join(dir, 'types');
		wrench.mkdirSyncRecursive(typeDir);
		util.writeIfDifferent(path.join(dir, 'index.html'), util.renderTemplate('./doc/index.ejs', metabase, __dirname).replace(/\s\s/g, ' '));
		for (var key in metabase.classes) {
			if (metabase.classes.hasOwnProperty(key)) {
				util.writeIfDifferent(path.join(typeDir, key.toLowerCase().replace(/[^a-z\.]/g, '') + '.html'), util.renderTemplate('./doc/type.ejs', {
					cls: metabase.classes[key],
					type: key
				}, __dirname));
			}
		}
	}
	function generateWithMetaBase(metabase, callback) {
		log.info('Crawling AST...');

		var jsEngine,
			jsEngineName = 'jsc',
			jsEngineFile = path.join(__dirname, jsEngineName, 'codegen.js'),
			generic,
			classObject,
			referenceTable = {},
			classes = metabase.classes,
			generate = {
				compiler: {},
				customclasses: {},
				classes: {},
				casts: {},
				generics: {},
				symbols: {},
				memory: {},
				prefix: '',
				name: ''
			};

		// iterate over the ast to do some processing
		for (var i = 0; i < asts.length; i++) {
			var ast = asts[i],
				symbols = ast.sourcefile.symbols,
				imports = ast.sourcefile.imports;

			if (ast.filename.match(/\.hjs$/i)) {
				var matches = fs.readFileSync(ast.filename, 'utf8').match(keywordMatcher);
				for (var j = 0, jL = matches.length; j < jL; j++) {
					referenceTable[matches[j]] = true;
				}
			}

			// Validate the used symbols.
			for (var c = 0; c < symbols.length; c++) {
				var symbol = symbols[c];
				if (symbol.name === 'alert') {
					continue;
				}
				switch (symbol.type) {
					case 'compiler':
						_.defaults(generate.compiler, symbol.value);
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
					case 'generic':
					{
						generic = findGenerics(symbol.args[0], classes);
						if (generic) {
							symbol.className = generic;
							classObject = classes[generic];
							symbol.object = {
								is_generic: true,
								type: symbol.targetType,
								object: classObject,
								className: symbol.className,
								mangledName: symbol.functionName,
								simpleType: symbol.functionName,
								fullInstanceName: symbol.targetType
							};
							symbol.mangledName = symbol.functionName;
							generate.generics[symbol.functionName] = symbol;
						}
						else if (imports.classes[symbol.args[0]]) {
							generic = imports.classes[symbol.args[0]];
							symbol.className = generic.name;
							symbol.object = {
								is_generic: true,
								type: symbol.targetType,
								object: generic,
								className: symbol.className,
								mangledName: symbol.functionName,
								simpleType: symbol.functionName,
								fullInstanceName: symbol.targetType
							};
							symbol.mangledName = symbol.functionName;
							generate.generics[symbol.functionName] = symbol;
						}
						else {
							log.fatal("couldn't resolve generic " + symbol.args[0].bold);
						}
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
						if (symbol.extendsName) {
							var extendsType = findClassOfType(symbol.extendsName, true, classes, generate);
							if (!extendsType) {
								return callback(new Error("Couldn't find Class " + symbol.extendsName + " in " + symbol.node.start.file + " at " + symbol.node.start.line));
							}
							symbol.extendsType = classes[extendsType];
							var interfaces = symbol.interfaces;
							if (interfaces && interfaces.length) {
								for (var x = 0; x < interfaces.length; x++) {
									var interfaceName = interfaces[x],
										found = findClassOfType(interfaceName, true, classes, generate);
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
									// check for fully qualified className
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
								var foundClass = findClassOfType(symbol.name, false, classes, generate);
								if (foundClass) {
									// found a class
									symbol.className = foundClass;
									symbol.object = classes[foundClass];
									symbol.type = 'class';
									generate.classes[symbol.name] = symbol;
								}
								else if (imports && symbol.name in imports.classes) {
									symbol.className = symbol.fullInstanceName = 'Wrapped' + symbol.name;
									symbol.object = imports.classes[symbol.name];
									symbol.mangledName = 'Wrapped' + symbol.name;
									symbol.is_imported_class = symbol.is_object = true;
									symbol.type = 'class';
									symbol.object.methods = _.flatten(_.values(symbol.object.methods || {}) || []);
									var methodsDict = {};
									symbol.object.methods.forEach(function(method) {
										var name = method.name.replace(/\./g, '_');
										if (methodsDict[name]) {
											methodsDict[name].push(method);
										}
										else {
											methodsDict[name] = [ method ];
										}
									});
									symbol.methods = methodsDict;
									generate.classes[symbol.name] = symbol;
								}
								else if (imports && symbol.name in imports.symbols) {
									// found an imported symbol
									symbol.className = symbol.name;
									symbol.object = imports.symbols[symbol.name];
									symbol.type = 'symbol';
									generate.symbols[symbol.name] = symbol;
								}
								else if (imports && symbol.name in imports.types) {
									console.log(imports.types[symbol.name]);
									log.fatal('Not Yet Implemented', 'Imported Type: ', symbol.name);
								}
								else {
									generic = findGenerics(symbol.name, classes);
									if (generic) {
										symbol.className = generic;
										symbol.object = classes[symbol.className];
										symbol.type = 'class';
										generate.classes[symbol.name] = symbol;
									}
									else if (symbol.name.indexOf('HyperloopCast') === 0) {
										// How did it get here?...
									}
									else {
										// unknown symbol
										log.fatal('Unknown Symbol:', symbol.name + '\r\n\t' + symbol.node.start.file.substr(2) + ':' + symbol.node.start.line + ':' + symbol.node.start.col);
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

		// make sure we have a valid JS engine
		if (!fs.existsSync(jsEngineFile)) {
			return callback(new Error("Invalid option specified for --jsengine. Couldn't find engine named: " + jsEngineName.red) + " at " + jsEngineFile.yellow);
		}
		jsEngine = require(jsEngineFile);

		generate.asts = asts;
		generate.dir = path.join(options.dest, options.name);
		generate.gen_dir = path.join(generate.dir, 'Generated');
		// generate compressed source
		generate.sourceResults = generateASTCallback(asts);
		generate.rawSource = {};
		Object.keys(generate.sourceResults).forEach(function(key) {
			generate.rawSource[key] = generate.sourceResults[key];
			generate.sourceResults[key] = JSON.stringify(generate.sourceResults[key]);
		});
		generate.name = 'GeneratedApp';
		wrench.mkdirSyncRecursive(generate.gen_dir);

		log.info('Generating code...');
		jsEngine.generateCode(generate, metabase, referenceTable, function(err, header, implementation, config) {
			if (err) {
				return callback(err);
			}
			util.writeIfDifferent(path.join(options.dest, 'config.json'), JSON.stringify(config, undefined, 4));
			util.writeIfDifferent(path.join(generate.dir, generate.prefix + generate.name + '.h'), header);
			util.writeIfDifferent(path.join(generate.dir, generate.prefix + generate.name + '.cpp'), implementation);

			// add raw source files
			Object.keys(generate.rawSource).forEach(function(key) {
				var theFile = path.join(generate.dir, key);
				wrench.mkdirSyncRecursive(path.dirname(theFile));
				fs.writeFileSync(theFile, generate.rawSource[key]);
			});

			log.info(options.name.green + ' successfully generated.');
			callback();
		});
	}
};


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

function findGenerics(name, classes) {
	var regex = new RegExp('\\.' + name + '`[12]<[^>]+>$');
	for (var key in classes) {
		if (classes.hasOwnProperty(key)) {
			if (regex.test(key)) {
				return key;
			}
		}
	}
	return null;
}

function findClassOfType(type, required, classes, generate) {
	type = type.replace(/::/g, '.');
	var matches = [],
		isNamespaced = type.indexOf('.') > 0,
		prefix = (isNamespaced ? '' : '\\.'),
		findType = new RegExp(prefix + type + '$');
	for (var key in classes) {
		if (classes.hasOwnProperty(key)) {
			if (key.match(findType)) {
				matches.push(key);
			}
		}
	}
	switch (matches.length) {
		case 0:
			return !required ? undefined : log.fatal('Unable to find class of type ' + type.bold + '!');
		case 1:
			return matches[0];
		default:
			// Attempt to disambiguate based on @compiler "using_namespaces".
			var usingNamespace = generate.compiler.using_namespaces || [];
			for (var i = 0, iL = matches.length; i < iL; i++) {
				var match = matches[i];
				for (var j = 0, jL = usingNamespace.length; j < jL; j++) {
					if (usingNamespace[j] === match.split('.').slice(0, -1).join('::')) {
						return match;
					}
				}
			}
			return log.fatal('' + type.bold + ' is ambiguous between ' + matches.join(' and ') + '!');
	}
}

function removeFalsy(a) {
	return !!a;
}