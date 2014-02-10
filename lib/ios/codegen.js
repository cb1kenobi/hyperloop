/**
 * iOS specific code generation
 */
var Codegen = require('../codegen').Codegen,
	ejs = require('ejs'),
	fs = require('fs'),
	path = require('path'),
	buildlib = require('./buildlib'),
	metabase = require('./metabase'),
	util = require('../util'),
	Uglify = require('uglify-js'),
	appc = require('node-appc'),
	log = require('../log'),
	crypto = require('crypto'),
	_ = require('underscore'),
	async = require('async'),
	wrench = require('wrench'),
	semver = require('semver'),
	zlib = require('zlib'),
	jsengine;

function iOSCodegen(options) {
	Codegen.call(this,options);
};

// extend our base class
iOSCodegen.prototype.__proto__ = Codegen.prototype;

function findMethod(ast, node, intf, name) {
	var p = intf;
	while(p) {
		if (name in p.methods) {
			return p.methods[name];
		}
		p = ast.classes[p.superClass];
	}
}

function findAST(asts, source) {
	for (var c=0;c<asts.length;c++) {
		if (asts[c].sourcefile===source) {
			return asts[c].ast;
		}
	}
	return null;
}

function resolveVariableInScope(node,name) {
	if (node.expression) {
		var expression = node.expression;
		// we need to walk the scope chain
		while (expression) {
			var found = expression.scope && expression.scope.find_variable && expression.scope.find_variable(name);
			if (found) {
				return found;
			}
			expression = expression.expression;
		}
	}
	return null;
}

function validateSourceAgainstAST(ast, sources, asts, used_classes) {
	sources.forEach(function(source){

		var sourceAST = findAST(asts,source);

		if (!sourceAST) {
			// this is OK, and happens if we're compiling JS that's not HJS (but we want to embed it)
			return;
		}

		var autoimports = [];

		source.symbols.forEach(function(symbol){
			var node = symbol.node;
			switch(symbol.type) {
				case 'cast': {
					var type = symbol.argType,
						intf = ast.classes[type];
					// make sure we autimport cast if found
					if (intf && used_classes.indexOf(type)===-1) {
						used_classes.push(type);
					}
					if (!intf) {
						throw new Error("Couldn't find class: "+type.red+" in "+node.start.file+" on "+node.start.line+":"+node.start.col);
					}
					source.generate.casts[type]=1;
					break;
				}
				case 'symbol': {
					var static = ast.symbols[symbol.value],
						intf = !static && ast.classes[symbol.value];

					if (static) {
						source.generate.statics[symbol.value] = symbol;
					}
					else if (intf) {
						if (used_classes.indexOf(symbol.value)===-1) {
							used_classes.push(symbol.value);
						}
						source.generate.classes[symbol.value] = symbol;
					}
					else {
						var proto = ast.protocols[symbol.value];
						if (proto) {
							source.generate.classes[symbol.value] = symbol;
						}
						else {
							if (symbol.value) {
								if (!symbol.framework) {
									// see if this is an autoimport of a package
									var obj = ast.system_frameworks.indexOf(symbol.value)!==-1 || ast.thirdparty_frameworks[symbol.value];
									if (!obj) {
										throw new Error("Can't find symbol "+symbol.value.red+" in "+node.start.file+" on "+node.start.line+":"+node.start.col);
									}
									autoimports.indexOf(autoimports)===-1 && autoimports.push(symbol.value);
								}
							}
							else {
								throw new Error("Can't find symbol "+symbol+" in "+symbol.framework.red+" in "+node.start.file+" on "+node.start.line+":"+node.start.col);
							}
						}
					}
					break;
				}
				case 'function': {
					// validate the function in the symbol table
					var obj = ast.symbols[symbol.value];
					if (!obj) {
						throw new Error("Can't find function "+symbol.value+" at "+node.start.file+" on "+node.start.line+":"+node.start.col);
					}
					break;
				}
				case 'package': {
					// validate that the imported package is found
					var obj = ast.system_frameworks.indexOf(symbol.value)!==-1 || ast.thirdparty_frameworks[symbol.value];
					if (!obj) {
						throw new Error("Can't find framework "+symbol.value+" at "+node.start.file+" on "+node.start.line+":"+node.start.col);
					}
					break;
				}
				case 'constructor': {
					var obj = ast.classes[symbol.value] || source.generate.customclasses[symbol.value];
					if (!obj) {
						throw new Error("Can't find class "+symbol.value+" at "+node.start.file+" on "+node.start.line+":"+node.start.col);
					}
					break;
				}
				case 'class': {
					source.generate.customclasses[symbol.className] = symbol;
					break;
				}
				case 'method': {
					//TODO: valid the methods.  we can't simply look them up, we have to walk the properties
					//in the case you have methods like this: chart.series.objectAtIndex(0).color

					// check for sentinel
					// check for argument types
					// check for formatter
					// check for argument counts
					// check for ambigious methods


					//resolveVariableInScope can be used to find a variable in the JS scope

					break;
				}
				case 'unknown': {
					var obj;
					switch (symbol.metatype) {
						case 'new': {
							obj = ast.classes[symbol.name];
							// see if it's a system class
							if (obj && autoimports.indexOf(obj.framework)!==-1) {
								if (used_classes.indexOf(symbol.name)===-1) {
									used_classes.push(symbol.name);
								}
								symbol.type = 'constructor';
								symbol.value = symbol.name;
								source.generate.classes[symbol.name] = symbol;
								break;
							}
							else {
								// see if it's a custom class
								obj = source.generate.customclasses[symbol.name];
								if (obj) {
									// good, it's found
									symbol.type = 'class';
									symbol.value = symbol.name;
									//	this.symbols.push({type:'class',node:node,className:className,extendsName:extendsName,interfaces:interfaces,methods:methods,source:node.print_to_string(),symbol:symbol});
								}
								else {
									// see if it's a third-party
									obj = ast.thirdparty_frameworks[symbol.name];
									symbol.type = 'constructor';
									symbol.value = symbol.name;
								}
							}
							break;
						}
						case 'function': {
							obj = ast.symbols[symbol.name];
							// check to see if it's a static
							if (obj && autoimports.indexOf(obj.framework)!==-1) {
								symbol.type = 'function';
								symbol.value = symbol.name;
								symbol.symbol = obj;
								source.generate.statics[symbol.value] = symbol;
							}
							break;
						}
						case 'method': {
							obj = ast.classes[symbol.property];
							if (obj && autoimports.indexOf(obj.framework)!==-1) {
								var m = obj.methods[symbol.name];
								if (m && m.length) {
									if (used_classes.indexOf(symbol.property)===-1) {
										used_classes.push(symbol.property);
									}
									source.generate.classes[symbol.property] = symbol;
									symbol.type = 'method';
									symbol.value = symbol.name;
								}
							}
							break;
						}
						case 'symbol': {
							var static = ast.symbols[symbol.name],
								intf = !static && ast.classes[symbol.name];

							if (static || intf) {
								symbol.value = symbol.name;
								obj = static;
							}
							if (static) {
								symbol.type = 'symbol';
								symbol.value = symbol.name;
								source.generate.statics[symbol.name] = symbol;
							}
							else if (intf) {
								symbol.type = 'class';
								symbol.value = symbol.name;
								if (used_classes.indexOf(symbol.name)===-1) {
									used_classes.push(symbol.name);
								}
								source.generate.classes[symbol.name] = symbol;
								obj = intf;
							}
							else {
								obj = ast.protocols[symbol.name];
								if (obj) {
									symbol.type = 'class';
									symbol.value = symbol.name;
									source.generate.classes[symbol.name] = symbol;
								}
							}
							break;
						}
						default: {
							throw new Error("unknown type: "+symbol.metatype);
						}
					}
					if (!obj) {
						console.error(symbol);
						throw new Error("Can't resolve symbol "+symbol.name.red+" at "+node.start.file.green+" on "+node.start.line+":"+node.start.col);
					}
					break;
				}
			}
		});
	});
}

function isArray(value) {
	return value && value.constructor.name===Array.prototype.constructor.name;
}

/**
 * make a multi-dimensional array
 */
function makeArray(value, lengths) {
	lengths && lengths.push(value.length);
	var array = [];
	for (var c=0;c<value.length;c++) {
		var entry = value[c];
		if (isArray(entry)) {
			entry = makeArray(entry,c===0 ? lengths : null);
		}
		array.push(entry);
	}
	return '{' + array.join(', ') + '}';
}


// implement the generate method
iOSCodegen.prototype.generate = function(asts,generateASTCallback,callback) {

	var generate = [],
		global_packages,
		system_frameworks = [],
		self = this,
		options = this.options,
		srcdir = options.srcdir,
		destdir = path.resolve(options.dest),
		cflags = [],
		linkflags = [],
		infoplist,
		appdelegate,
		minversion = options['min-version'] || '7.0',
		nativeargs = [],
		includedirs = [],
		jsengineName = (!options.jsengine || options.jsengine===true) ? 'jsc' : options.jsengine,
		jsengineFile = path.join(__dirname,jsengineName,'codegen.js'),
		prefix = this.options.classprefix,
		sourcefiles = [],
		simulator_only = options.command === 'launch';

	if (options.ticurrent) {
		// detect our current Titanium SDK environment
		appc.environ.detect();
		// try and find the SDK info, using a version if passed in or null to find latest
		var tisdk = appc.environ.getSDK(options.tisdk);
		if (!tisdk) {
			return callback(new Error("Couldn't find Titanium SDK "+(options.tisdk||'')));
		}
		var tisdkDir = tisdk.platforms.iphone && tisdk.platforms.iphone.path;
		if (!tisdkDir) {
			return callback(new Error("Couldn't find Titanium SDK for iOS"));
		}
		
		cflags.push('-DUSE_TIJSCORE=1');
		cflags.push('-DHL_DISABLE_CRASH');
		cflags.push('-I'+util.escapePaths(path.resolve(path.join(tisdkDir,'headers'))));
		cflags.push('-I'+util.escapePaths(path.resolve(path.join(tisdkDir,'include'))));
		cflags.push('-I'+util.escapePaths(path.resolve(path.join(tisdkDir,'include','TiCore'))));
		linkflags.push('-L'+util.escapePaths(path.resolve(tisdkDir)));
		linkflags.push('-lTiCore');
	}


	// make sure it's a valid JS engine
	if (!fs.existsSync(jsengineFile)) {
		return callback(new Error("Invalid option specified for --jsengine. Couldn't find engine named: "+jsengineName.red)+" at "+jsengineFile.yellow);
	}

	// load the jsengine codegen file dynamically
	jsengine = require(jsengineFile);

	if (!fs.existsSync(srcdir)) {
		wrench.mkdirSyncRecursive(srcdir);
	}

	if (options.includes) {
		if (typeof(options.includes)==='string') {
			includedirs.push(options.includes);
		}
		else {
			includedirs = includedirs.concat(options.includes);
		}
		log.debug('added include dirs',includedirs.join(',').cyan);
	}

	if (options.cflags) {
		if (typeof(options.cflags)==='string') {
			cflags.push(options.cflags);
		}
		else {
			cflags = cflags.concat(options.cflags);
		}
		log.debug('added cflags',cflags.join(',').cyan);
	}

	buildlib.getSystemFrameworks(function(err,frameworks){
		if (err) return callback(err);

		var used_classes = [],
			global_includes = [],
			imported_frameworks = [];


		// figure out all the system frameworks
		frameworks.forEach(function(f){
			var name = f.replace('.framework','');
			if (system_frameworks.indexOf(name)===-1) {
				system_frameworks.push(name);
			}
		});

		// record system frameworks
		system_frameworks.forEach(function(f){
			imported_frameworks.push(f);
		});

		global_packages = system_frameworks;

		var commonClasses = [],
			useArrayBuffer = false;

		try {
			self.sources.forEach(function(source){

				var imports = [],
					includes = [],
					constructors = {},
					functions = {},
					memory = {};

				source.symbols.forEach(function(symbol){
					switch(symbol.type) {
						case 'package': {
							var key = '#import <'+symbol.value+'/'+symbol.value+'.h>';
							global_includes.indexOf(key)===-1 && global_includes.push(key);
							imported_frameworks.indexOf(symbol.value)===-1 && imported_frameworks.push(symbol.value);
							break;
						}
						case 'compiler': {
							if (symbol.value.cflags) {
								if (typeof(symbol.value.cflags)==='string') {
									symbol.value.cflags = [symbol.value.cflags];
								}
								cflags = _.compact(_.uniq(cflags.concat(symbol.value.cflags)));
								nativeargs = cflags;
							}
							if (symbol.value.linkflags) {
								if (typeof(symbol.value.linkflags)==='string') {
									symbol.value.linkflags = [symbol.value.linkflags];
								}
								linkflags = _.compact(_.uniq(linkflags.concat(symbol.value.linkflags)));
							}
							if (symbol.value.includedirs) {
								if (typeof(symbol.value.includedirs)==='string') {
									symbol.value.includedirs = [symbol.value.includedirs];
								}
								symbol.value.includedirs.forEach(function(dir){
									nativeargs.push('-I'+dir);
									cflags.push('-I'+dir);
									includedirs.push(dir);
								});
								includedirs = _.uniq(includedirs);
								nativeargs = _.uniq(nativeargs);
								cflags = _.uniq(cflags);
							}
							infoplist = symbol.value.infoplist;
							appdelegate = symbol.value.AppDelegate;
							break;
						}
						case 'constructor': {
							if (!(symbol.value in constructors)) {
								constructors[symbol.value] = symbol;
							}
							break;
						}
						case 'function': {
							if (!(symbol.value in functions)) {
								functions[symbol.value] = [symbol];
							}
							else {
								functions[symbol.value].push(symbol);
							}
							break;
						}
						case 'memory': {

							if (isArray(symbol.value)) {
								var lengths = [],
									array = makeArray(symbol.value,lengths);
								var subscript = '['+lengths.join('][')+']';

								symbol.assign = symbol.nativename;
								symbol.code = 'float '+symbol.nativename+'$ '+ subscript + ' = ' + array + ';';
								symbol.code += '\nfloat *'+symbol.nativename+' = (float *)malloc(sizeof('+symbol.nativename+'$));';
								symbol.code += '\nmemcpy('+symbol.nativename+',&'+symbol.nativename+'$,sizeof('+symbol.nativename+'$));';
								symbol.length = 'sizeof('+symbol.nativename+'$)';
							}
							else {
								if (symbol.value===null) {
									symbol.code = 'float *'+symbol.nativename+' = (float *)malloc(sizeof(float) * 1);\n';
									// initialize to NAN
									symbol.code += symbol.nativename+'[0] = NAN;';
									symbol.length = 'sizeof(float)*1';
								}
								else {
									symbol.code = 'void *'+symbol.nativename+' = (void *)malloc('+symbol.value+');\n';
									// initialize to NAN
									symbol.code += '((float*)'+symbol.nativename+')[0] = NAN;';
									symbol.length = symbol.value;
								}
								symbol.assign = symbol.nativename;
							}
							memory[symbol.nativename] = symbol;
							break;
						}
						case 'import': {
							var found = false;
							for (var c=0;c<includedirs.length;c++) {
	 							var f = path.join(includedirs[c], symbol.value);
								if (fs.existsSync(f)) {
									found = true;
									break;
								}
							}
							if (!found) {
								throw new Error("Couldn't find import "+symbol.value+" in "+symbol.node.start.file+" at "+symbol.node.start.line+":"+symbol.node.start.col+". Looked in the following directories: "+includedirs.join(",").yellow);
							}
							if (includes.indexOf(symbol.value)===-1) {
								includes.push(symbol.value);
								global_includes.push(symbol.value);
							}
							break;
						}
					}
				});

				var obj = {
					name: source.name,
					filename: source.filename,
					statics: {},
					classes: {},
					customclasses: {},
					casts:{},
					imports: imports,
					memory: memory,
					constructors: constructors,
					functions: functions,
					includes: includes,
					nativeFilename: source.generateFilename(srcdir),
					cached: source.cached,
					dirname: source.dirname,
					commonClasses: source.commonClasses
				};

				if (source.commonClasses.length) {
					commonClasses = _.uniq(commonClasses.concat(source.commonClasses));
					if (!useArrayBuffer && source.useArrayBuffer) {
						useArrayBuffer = true;
					}
				}

				source.generate = obj;
				generate.push(obj);
				sourcefiles.push(source.filename);
			});
		}
		catch (E) {
			log.debug(E.stack)
			return callback(E);
		}

		global_packages = system_frameworks;

		// set them so we can use them later in packaging, etc.
		options.cflags = cflags;
		options.linkflags = linkflags;
		options.infoplist = infoplist;
		options.appdelegate = appdelegate;

		buildlib.getXcodeSettings(function(err,settings){
			if (err) return callback(err);

			// semver requires 0.0.0 versioning
			var version = settings.version;

			if (version.split('.').length===2) {
				version+='.0';
			}

			// we require a minimum of iOS 7 to build
			if (!semver.satisfies(version,'>=7.0.0')) {
				return callback(new Error("iOS SDK must be >= "+"7.0".green+", you are currently using: "+settings.version.red+" and your active Xcode is set to "+settings.xcodePath.green));
			}

			var tmpdir = process.env.TMPDIR || process.env.TEMP || '/tmp';

			if (process.platform==='darwin') {
				tmpdir = path.join(process.env['HOME'],'Library','Application Support','org.appcelerator.hyperloop');
				wrench.mkdirSyncRecursive(tmpdir);
			}

			var moduleCache = path.join(tmpdir,'cache'),
				headerfile = path.join(tmpdir,'objc.h'),
				objch = [];

			global_packages.forEach(function(p){
				objch.push('@import '+p+';');
			});

			// we add the clangparser.js checksum to the hashkey such that if we change the way clangparser works, it will
			// automatically re-generate the ast
			var clangChecksum = crypto.createHash('sha1').update(fs.readFileSync(path.join(__dirname, '..', 'clangparser.js')).toString()).digest('hex');

			// setup the libname
			options.libname = options.libname || 'lib'+options.name+'.a';

			// always sort our imports/natives so that we can hash. if all the
			// imports and natives are the same (as evidenced by the same hash),
			// we can re-use the same module AST that is cached
			var hashkey = objch.sort().join('') +
						  cflags.sort().join('') +
						  linkflags.sort().join('') +
						  imported_frameworks.sort().join('') +
						  jsengine.arc +
						  clangChecksum,
				hash = crypto.createHash('sha1').update(hashkey).digest('hex'),
				cacheFile = path.join(moduleCache, hash+'.json.gz'),
				libfile = path.join(options.dest, options.libname);

			function executeWithClangAST(ast) {

				if (!ast || !ast.symbols || !ast.classes) {
					log.debug(ast);
					throw new Error('invalid clang AST');
				}

				options.thirdparty_frameworks = ast.thirdparty_frameworks;

				// valid our source code before we generate against the ast
				validateSourceAgainstAST(ast, self.sources, asts, used_classes);

			    // now generate the asts
			    var sourceResults = generateASTCallback(asts);

				var srcs = [],
					tasks = [],
					codegenerate = {},
			    	generated = [],
			    	depends = used_classes,
			    	commonClassJS = '';


			    commonClasses.forEach(function(f){
			    	var fp = path.join(__dirname,'..','common','js',f+'.js'),
			    		buf = fs.readFileSync(fp);
			    	commonClassJS+='(function(exports){\n';
			    	commonClassJS+=buf.toString()+'\n';
					commonClassJS+='})(this);\n';
			    });

			    if (commonClassJS) {
					var UglifyJS = require('uglify-js');
					var uast = UglifyJS.parse(commonClassJS);
					zlib.gzip(uast.print_to_string(),function(err,buf){
						if (err) return callback(err);
						var jsbuf = getJSBuffer(buf,'		',0,30);
						runGeneration(jsbuf);
					});
				}
				else {
					runGeneration();
				}

				var genopts;

				function runGeneration(jsbuf) {
				   	try {
				   		genopts = _.defaults(options,{
				   			metadata: ast,
				   			generation: codegenerate,
				   			interfaceName: depends[0]||'UIApplication',
				   			depends: depends,
				   			generated: generated,
				   			prefix: prefix,
				   			srcs: srcs,
				   			srcdir: srcdir,
				   			minversion: minversion,
				   			generate: generate,
				   			useArrayBuffer: useArrayBuffer
				   		});
				   		// delegate the code generation and rendering to the engine codegen implementation
				   		jsengine.generate(genopts, executeCodeGen, jsbuf);
				   	}
				   	catch(E) {
				   		log.debug(E.stack)
				   		log.fatal(E);
				   	}
				}

			   	function executeCodeGen() {
					generate.forEach(function(gen){

						// get our generated JS source code
						var sourcecode = sourceResults[gen.filename];
						if (!sourcecode) {
							log.fatal("Can't find source for",gen.filename);
						}

						// check the classes and make sure they are valid
						Object.keys(gen.classes).forEach(function(name){
							var symbol = gen.classes[name],
								global = ast.classes[name] || ast.protocols[name];
							if (!global) {
								throw new Error("Couldn't locate class "+name.magenta.underline+" in "+symbol.node.start.file+" at "+symbol.node.start.line+":"+symbol.node.start.col);
							}
							if (global.framework && imported_frameworks.indexOf(global.framework)===-1) {
								throw new Error("Couldn't locate package for "+name.magenta.underline+" in "+symbol.node.start.file+" at "+symbol.node.start.line+":"+symbol.node.start.col+". Make sure you have "+("@import('"+global.framework+"/"+name+"');").magenta.underline);
							}
							if (global.import && gen.includes.indexOf(global.import)===-1) {
								gen.includes.push(global.import);
							}
							symbol.ref = global;
							// if not in system frameworks, mark as custom framework
							if (system_frameworks.indexOf(global.framework)===-1) {
								symbol.thirdparty = true;
								symbol.import = global.framework+'/'+global.framework+'.h';
								symbol.thirdparty_framework = global.framework;
							}
						});

						// check the statics and make sure they are valid
						Object.keys(gen.statics).forEach(function(name){
							var symbol = gen.statics[name],
								global = ast.symbols[name];
							if (!global) {
								throw new Error("Couldn't locate static symbol "+name.magenta.underline+" in "+symbol.node.start.file+" at "+symbol.node.start.line+":"+symbol.node.start.col);
							}
							if (global.framework && imported_frameworks.indexOf(global.framework)===-1) {
								throw new Error("Couldn't locate package for "+name.magenta.underline+" in "+symbol.node.start.file+" at "+symbol.node.start.line+":"+symbol.node.start.col+". Make sure you have "+("@import('"+global.framework+"/"+name+"');").magenta.underline);
							}
							if (global.import && imported_frameworks.indexOf(global.import)===-1) {
								gen.includes.push(global.import);
							}
							symbol.ref = global;
						});

						Object.keys(gen.functions).forEach(function(name){
							var fns = gen.functions[name],
								f = ast.symbols[name];
							if (!f) {
								throw new Error("Couldn't locate function "+name.magenta.underline+" in "+symbol.node.start.file+" at "+symbol.node.start.line+":"+symbol.node.start.col);
							}

							fns.forEach(function(symbol){

								// check to see if this is a vararg if the selector ends with
								// ...)
								var variadic = /\.\.\.\)$/.test(f.signature);

								if (variadic) {
									if (/\.\.\.\)$/.test(f.signature)==false) {
										throw new Error("Wrong number of arguments passed to "+name.magenta.underline+" in "+symbol.node.start.file+" at "+symbol.node.start.line+":"+symbol.node.start.col+". Expected: "+f.arguments.length+", received: "+symbol.args.length);
									}
									else {
										if (symbol.args.length < 2) {
											throw new Error("Wrong number of arguments passed to "+name.magenta.underline+" in "+symbol.node.start.file+" at "+symbol.node.start.line+":"+symbol.node.start.col+". Expected a minimum of 2 since this is a variadic function, received: "+symbol.args.length);
										}
										// this is a variadic method so we need to indicate so we
										// can generate the correct method body
										var noResult = f.returnType==='void';
										f.vararg = true;
										symbol.varargSymbol = f.name+'$'+symbol.args.length;
										symbol.varargCount = symbol.args.length;
										symbol.varargResult = !noResult;
									}
								}
								else if (f.arguments.length!=symbol.args.length) {
									throw new Error("Wrong number of arguments passed to "+name.magenta.underline+" in "+symbol.node.start.file+" at "+symbol.node.start.line+":"+symbol.node.start.col+". Expected: "+f.arguments.length+", received: "+symbol.args.length);
								}
							});
						});

						// check to see if cached and if so, don't re-write it
						if (gen.cached) {
							srcs.push(gen.nativeFilename);
							log.debug('found unchanged objective-c source for '+gen.name.yellow+' to '+gen.nativeFilename.yellow);
						}
						else {
							// delegate generation
							// generate the native source to the adapter
							tasks.push(function(callback){
								var isEmpty = sourcecode.length===0;
								zlib.gzip(sourcecode,function(err,buf){
									if (err) return callback(err);
									// jsBuffer is the encoded JS source
									gen.jsBuffer = isEmpty ? '0' : getJSBuffer(buf,'		',0,30);
									gen.prefix = prefix;
									jsengine.generateCode(gen,genopts,function(err,source){
										if (err) return callback(err);
										// write out the source file
										var fn = gen.nativeFilename;
										srcs.push(fn);
										log.debug('wrote source for '+gen.name.yellow+' to '+fn.yellow);
										fs.writeFile(fn, source, callback);
									});
								});
							});
						}
					});

					// write all the files and then we will compile and link
					async.parallel(tasks,function(err){
						if (err) return callback(err);

						jsengine.precompile(genopts,function(err){
							if (err) return callback(err);

							var config = {
								minVersion: minversion,
								libname: options.libname,
								srcfiles: srcs,
								outdir: options.dest,
								cflags: cflags.concat(['-I'+srcdir,'-I'+path.join(__dirname,jsengineName,'templates','source')]),
								linkflags: linkflags,
								no_arc: !jsengine.arc,
								debug: options.debug,
								jobs: options.jobs, // parallel compile jobs
								simulator_only: simulator_only,
								force: options.force
							};

							log.debug('using compiler/linker config:',JSON.stringify(config).grey);

							buildlib.compileAndMakeStaticLib(config, function(err,results){
								if (err) return callback(err);
								log.info('Generated universal library file at '+results.libfile.yellow);
								return callback(null,results.libfile);
							});
						});

					});
				}

			}

			// make sure the clang target is generated
			if (!fs.existsSync(moduleCache)) {
				fs.mkdir(moduleCache);
			}
			fs.writeFileSync(headerfile, objch.join('\n') + '\n' + global_includes.join('\n'));

			// load the metabase with clang
			metabase.loadMetabase(
				headerfile,
				{
					arc: jsengine.arc,
					cacheFile: cacheFile,
					minVersion: minversion,
					nativeArgs: nativeargs
				},
				function(err, result) {
					if (err) { return callback(err); }
					executeWithClangAST(result);
				}
			);

		});
	});

}

function getJSBuffer(data, indent, position, split) {
	var length = data.length,
		output = [];
	for (var i=0;i<length;++i,++position) {
		if ((position % split) == 0) {
            output.push("\n"+indent);
        }
        if (position > 0) {
			output.push(",");
		}
		output.push(data.readUInt8(i));
	}
	return output.join('').trim();
}

function formatSource(code, indent) {
    var toks = code.split('\n'),
        result = [toks[0]];
    toks.slice(1).forEach(function(line){
        result.push(indent+line);
    });
    return result.length > 1 ? (result.join('\n') + '\n' + indent) : result[0] + '\n';
}

ejs.filters.source = function(code, indent) {
	return formatSource(code,indent===undefined?'\t':indent);
}

exports.Codegen = iOSCodegen;
