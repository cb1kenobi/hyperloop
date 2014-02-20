/**
 * JavaScriptCore C API generation
 */
var fs = require('fs'),
	path = require('path'),
	ejs = require('ejs'),
	wrench = require('wrench'),
	_ = require('underscore'),
	log = require('../../log'),
	util = require('../../util'),
	buildlib = require('../buildlib'),
	typegenerator = require('./typegenerator'),
	template = fs.readFileSync(path.join(__dirname,'templates','template.ejs')).toString(),
	CONVERTER_FILENAME = 'converters.h';


exports.generate = generate;
exports.generateCode = generateCode;
exports.precompile = precompile;
exports.arc = false;
exports.compile = compile; //for unit testing only

function compile(metadata, config, callback) {
	var buildlib = require('../buildlib');
	var includedir = path.join(__dirname,'templates','source');
	var builddir = config.builddir;
	var outdir = config.outdir || builddir;
	var buildconfig = {
		minversion: config.version,
		version: config.version,
		srcdir: outdir,
		libname: config.libname || 'libapp.a',
		outdir: outdir,
		metadata: metadata,
		cflags: ['-I'+includedir,'-I'+outdir],
		linkflags: [],
		no_arc: true,
		debug: config.debug,
		dest: builddir,
		outdir: outdir,
		version: config.version,
		functions: {},
		statisics: {},
		customclasses: {},
		classes: {},
		generate: [],
		srcs: []
	};
	log.debugLevel = true;
	generate(buildconfig, function(err) {
		if (err) return callback(err);
		config.types.forEach(function(k){
			typegenerator.resolveType(buildconfig.state,k);
		});
		precompile(buildconfig, function(err,sources) {
			buildconfig.srcfiles = sources;
			buildlib.compileAndMakeStaticLib(buildconfig, callback);
		});
	});
}


/**
 * this method gets called once per JS file where gen is a dictionary of the following:
 *
 * name (string)                        - name of the module (filename without path or extension)
 * filename (string)                    - the filename (including path from source directory)
 * statics (dictionary)                 - statics that have been imported
 * classes (dictionary)                 - classes that have been imported
 * customclasses (dictionary)           - custom classes created with @class
 * imports (array)                      - imports that are found
 * memory (dictionary)                  - @memory references
 * constructors (dictionary)            - any new Class from @class or @import
 * functions (dictionary)               - functions that have been imported
 * includes (array)                     - includes (such as a third-party #include) that can't be @import (in ObjC)
 * nativeFilename (string)              - outfile file for the native ObjC class
 * dirname (string)                     - directory path
 *
 */
function generateCode (gen, genopts, callback) {
	log.debug('generating code for',gen.filename.magenta);

	var state = genopts.state,
		types = [],
		imports = [],
		classes = [],
		includes = [],
		code = [],
		externs = [];

	state.casts = {};

	genopts.generate.forEach(function(e){
		var c = e.casts;
		if (c) {
			for (var k in c) {
				state.casts[k]=1;
			}
		}
	});

	Object.keys(gen.functions).forEach(function(name) {
		var type = typegenerator.resolveType(state, name);
		type.object.framework && imports.push(type.object.framework);
	});

	Object.keys(gen.statics).forEach(function(sym){
		var type = typegenerator.resolveType(state, sym);
		type.object.framework && imports.push(type.object.framework);
		switch(type.metatype) {
			case 'function': {
				var fn = 'Hyperloop'+type.mangledName,
					cn = type.mangledName,
					extern = 'extern JSValueRef '+fn+' (JSContextRef ctx, JSObjectRef function, JSObjectRef object, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)';

				//TODO: turn this into a register function
				code.push('JSStringRef '+cn+'Prop = JSStringCreateWithUTF8CString("'+sym+'");');
				code.push('if (!JSObjectHasProperty(ctx,object,'+cn+'Prop))');
				code.push('{')
				code.push('\tJSObjectRef '+cn+'ObjectRef = JSObjectMakeFunctionWithCallback(ctx,'+cn+'Prop,'+fn+');');
				code.push('\tJSObjectSetProperty(ctx,object,'+cn+'Prop,'+cn+'ObjectRef,kJSPropertyAttributeReadOnly|kJSPropertyAttributeDontDelete,0);');
				code.push('}')
				code.push('JSStringRelease('+cn+'Prop);');
				code.push('');
				externs.push(extern);
				break;
			}
			case 'symbol': {
				if (type.object && type.object.framework) {
					gen.imports.push(type.object.framework);
				}
				typegenerator.resolveType(state,type.object.type);
				code.push('HyperloopRegisterSymbol'+type.mangledName+'(ctx,object);');
				code.push('');
				externs.push('extern void HyperloopRegisterSymbol'+type.mangledName+'(JSContextRef,JSObjectRef);');
				break;
			}
		}
	});

	Object.keys(gen.customclasses).forEach(function(cn) {
		//TODO: turn this into a register function
		var fn = 'MakeObjectFor'+cn+'ConstructorCallback',
			extern = 'extern JSValueRef MakeObjectFor'+cn+'ConstructorCallback (JSContextRef ctx, JSObjectRef function, JSObjectRef object, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)';

		code.push('JSStringRef '+cn+'Prop = JSStringCreateWithUTF8CString("Make$'+cn+'");');
		code.push('JSObjectRef '+cn+'ObjectRef = JSObjectMakeFunctionWithCallback(ctx,'+cn+'Prop,'+fn+');');
		code.push('if (!JSObjectHasProperty(ctx,object,'+cn+'Prop))');
		code.push('{');
		code.push('\tJSObjectSetProperty(ctx,object,'+cn+'Prop,'+cn+'ObjectRef,kJSPropertyAttributeReadOnly|kJSPropertyAttributeDontDelete,0);');
		code.push('}');
		code.push('JSStringRelease('+cn+'Prop);');
		code.push('');

		externs.push(extern);
	});

	Object.keys(gen.classes).forEach(function(cn) {
		var type = typegenerator.resolveType(state,cn);
		type.object.framework && imports.push(type.object.framework);
		if (type.metatype=='interface' && !(cn in gen.customclasses)) {
			classes.push(cn);
		}
	});

	classes.forEach(function(cn) {
		//TODO: turn this into a register function
		var fn = 'JSObjectRef '+cn+'ObjectRef = MakeObjectFor'+cn+'Constructor',
			extern = 'extern JSObjectRef MakeObjectFor'+cn+'Constructor (JSContextRef)';

		code.push('JSStringRef '+cn+'Prop = JSStringCreateWithUTF8CString("'+cn+'");');
		code.push('if (!JSObjectHasProperty(ctx,object,'+cn+'Prop))');
		code.push('{');
		code.push('\t'+fn+'(ctx);');
		code.push('\tJSObjectSetProperty(ctx,object,'+cn+'Prop,'+cn+'ObjectRef,kJSPropertyAttributeReadOnly|kJSPropertyAttributeDontDelete,0);');
		code.push('}');
		code.push('JSStringRelease('+cn+'Prop);');
		code.push('');

		externs.push(extern);
	});

	imports = _.uniq(imports);

	typegenerator.sortOutSystemFrameworks(state,imports,includes);

	// load the jsengine template file dynamically
	var source = ejs.render(template, {
		gen: gen,
		externs: externs,
		imports: imports,
		_includes: includes,
		code: code.join('\n'),
		metadata: genopts.metadata,
		indentify: typegenerator.indentify,
		memory: gen.memory,
		casts: state.casts
	});

	return callback(null, source);
}

/**
 * this method is called before the JS source generation begins
 * with the following keys:
 *
 * dest (string)                        - the destination directory
 * name (string)                        - the name of the app
 * appid (string)                       - the application identifier
 * debug (boolean)                      - present if --debug passed in or missing if not
 * platform (string)                    - should be ios
 * launch (boolean)                     - present if --launch passed in or missing if not
 * srcdir (string)                      - directory to place generated source files
 * classprefix (string)                 - string to prefix any class names
 * force (boolean)                      - force generation
 * cflags (dictionary)                  - any compiler CFLAGS
 * linkflags (dictionary)               - any linker LDFLAGS
 * infoplist (dictionary)               - Info.plist modifications
 * thirdparty_frameworks (dictionary)   - dictionary of non system frameworks used
 * metadata (dictionary)                - the metabase
 * srcs (array)                         - array of sources that should be compiled
 * minversion (string)                  - ios min version
 * generate (array)                     - each JS file that must be generated
 *
 * Inside the generate dictionary, you have the following keys:
 *
 * name (string)                        - name of the module (filename without path or extension)
 * filename (string)                    - the filename (including path from source directory)
 * statics (dictionary)                 - statics that have been imported
 * classes (dictionary)                 - classes that have been imported
 * customclasses (dictionary)           - custom classes created with @class
 * imports (array)                      - imports that are found
 * memory (dictionary)                  - @memory references
 * constructors (dictionary)            - any new Class from @class or @import
 * functions (dictionary)               - functions that have been imported
 * includes (array)                     - includes (such as a third-party #include) that can't be @import (in ObjC)
 * nativeFilename (string)              - outfile file for the native ObjC class
 * dirname (string)                     - directory path
 *
 */
function generate (genopts, callback, commonJSBuf) {
	log.debug('generate');

	buildlib.getSystemFrameworks(function(err,frameworks){
		if (err) return callback(err);
		genopts.state = typegenerator.createState(genopts.metadata,genopts.minversion,null,genopts.classprefix);
		genopts.state.system_frameworks = frameworks.map(function(f){return f.replace('.framework','')});
		
		if (commonJSBuf) {
			var code = typegenerator.generateCustomJS(genopts.state, commonJSBuf, genopts.classprefix, genopts.useArrayBuffer),
				filename = path.join(genopts.srcdir||genopts.dest,genopts.classprefix+'commoncode.m');
			fs.writeFileSync(filename,code);
			genopts.srcs.push(filename);
		}

		callback();
	});
}

/**
 * this method is called after all JS sources are generated and just before
 * we invoke the compiler
 */
function precompile(genopts, callback) {
	log.debug('precompile');

	var builddir = genopts.dest,
		outdir = genopts.srcdir || builddir,
		version = genopts.minversion;

	if (!fs.existsSync(outdir)) {
		wrench.mkdirSyncRecursive(outdir);
	}

	// console.log(typegenerator.resolveType(genopts.state,'NSURL').class_methods.URLWithString);
	// log.exit(1);

	buildlib.getSystemFrameworks(function(err,frameworks){
		if (err) return callback(err);

		try {
			var sources = genopts.srcs,
				state = genopts.state,
				interfaces = [],
				symbols = [],
				code = [],
				externs = [],
				customclasses = {};

			genopts.generate.forEach(function(e){
				var dict = e.customclasses;
				dict && Object.keys(dict).forEach(function(k){
					var v = dict[k];
					customclasses[k] = v;
				});
			});

			// generate any custom classes that have been specified
			Object.keys(customclasses).forEach(function(n){
				var result = typegenerator.generateCustomClass(state,n,customclasses[n],outdir,sources,version),
					fh = path.join(outdir, 'js_custom_'+genopts.classprefix+n+'.h'),
					fp = path.join(outdir, 'js_custom_'+genopts.classprefix+n+'.m');
				fs.writeFileSync(fh,result.header);
				fs.writeFileSync(fp,result.implementation);
				sources.push(fp);
				externs.push('extern JSObjectRef MakeObjectFor'+n+'(JSContextRef,'+n+'*);');
				var type = typegenerator.resolveType(state,n);
				type.object.import = '"js_custom_'+genopts.classprefix+n+'.h"';
				interfaces.push(type);
			});

			_.compact(Object.keys(state.dependencies).sort()).forEach(function(symbolName) {
				var obj = state.dependencies[symbolName];
				// log.debug(symbolName,'=>',obj.metatype)
				try {
					switch (obj.metatype) {
						case 'interface': {
							interfaces.push(obj);
							// let it fall through
						}
						case 'protocol': {
							var className = obj.name,
								mangledName = typegenerator.mangleTypeName(className),
								fn = 'js_'+mangledName,
								framework = (obj && obj.object && obj.object.framework) || (obj && obj.object && obj.object.thirdparty_framework) || 'Foundation',
								fp = path.join(outdir, 'js_'+framework, fn),
								source = fp+'.m',
								header = fp+'.h',
								cast = state.casts[obj.simpleType];
							if (sources.indexOf(source)===-1) {
								if (!fs.existsSync(path.dirname(fp))) {
									wrench.mkdirSyncRecursive(path.dirname(fp));
								}
								if (!obj.is_custom_class) {
									util.writeIfDifferent(source, typegenerator.generateInterface(state,className,cast));
									util.writeIfDifferent(header,typegenerator.generateInterfaceHeader(state,className,cast));
									sources.push(source);
								}
							}
							break;
						}
						case 'block': {
							if (symbols.indexOf(obj.mangledName)===-1) {
								code.push(typegenerator.generateBlock(state,obj));
								symbols.push(obj.mangledName);
								state.externs[obj.type].length && (externs = externs.concat(state.externs[obj.type]));
							}
							break;
						}
						case 'function_pointer': {
							if (symbols.indexOf(obj.mangledName)===-1) {
								code.push(typegenerator.generateFunctionPointer(state,obj));
								symbols.push(obj.mangledName);
								state.externs[obj.type].length && (externs = externs.concat(state.externs[obj.type]));
							}
							break;
						}
						case 'other':  {
							if (obj.is_pointer) {
								if (sources.indexOf(source)===-1) {
									var simpleType = 'js_'+typegenerator.mangleTypeName(symbolName),
										fp = path.join(outdir,simpleType),
										source = fp+'.m',
										header = fp+'.h';
									fs.writeFileSync(source,typegenerator.generateStruct(state,symbolName));
									fs.writeFileSync(header,typegenerator.generateStructHeader(state,symbolName));
									sources.push(source);
								}
							}
							break;
						}
						case 'primitive': {
							if (symbols.indexOf(obj.mangledName)===-1) {
								code.push(typegenerator.generatePrimitive(state,symbolName));
								symbols.push(obj.mangledName);
								state.externs[obj.type].length && (externs = externs.concat(state.externs[obj.type]));
							}
							break;
						}
						case 'struct': {
							var simpleType = 'js_'+typegenerator.mangleTypeName(symbolName),
								fn = (obj && obj.object && obj.object.framework ? 'js_'+obj.object.framework+'/' : '') + simpleType,
								fp = path.join(outdir,fn),
								source = fp+'.m',
								header = fp+'.h';
							if (sources.indexOf(source)===-1) {
								if (!fs.existsSync(path.dirname(fp))) {
									wrench.mkdirSyncRecursive(path.dirname(fp));
								}
								if (!fs.existsSync(source) || genopts.force) {
									fs.writeFileSync(source,typegenerator.generateStruct(state,symbolName));
								}
								if (!fs.existsSync(header) || genopts.force) {
									fs.writeFileSync(header,typegenerator.generateStructHeader(state,symbolName));
								}
								sources.push(source);
							}
							break;
						}
						case 'enum': {
							if (symbols.indexOf(obj.mangledName)===-1) {
								code.push(typegenerator.generateEnum(state,obj));
								symbols.push(obj.mangledName);
								state.externs[obj.type].length && (externs = externs.concat(state.externs[obj.type]));
							}
							break;
						}
						case 'typedef': {
							var className = obj.name,
								fn = 'js_'+typegenerator.mangleTypeName(className),
								fn = (obj && obj.object && obj.object.framework ? 'js_'+obj.object.framework+'/' : '') + fn,
								fp = path.join(outdir, fn),
								source = fp+'.m',
								header = fp+'.h';
							if (sources.indexOf(source)===-1) {
								if (!fs.existsSync(path.dirname(fp))) {
									wrench.mkdirSyncRecursive(path.dirname(fp));
								}
								if (!fs.existsSync(source) || genopts.force) {
									fs.writeFileSync(source,typegenerator.generateTypedef(state,symbolName));
								}
								if (!fs.existsSync(header) || genopts.force) {
									fs.writeFileSync(header,typegenerator.generateTypedefHeader(state,symbolName));
								}
								sources.push(source);
							}
							break;
						}
						case 'function': {
							if (symbols.indexOf(obj.mangledName)===-1) {
								code.push(typegenerator.generateFunction(state,obj));
								symbols.push(obj.mangledName);
								state.externs[obj.type].length && (externs = externs.concat(state.externs[obj.type]));
							}
							break;
						}
						case 'symbol': {
							if (symbols.indexOf(obj.mangledName)===-1) {
								var type = typegenerator.resolveType(state, obj.object.type);
								if (!type) {
									log.fatal("Can't resolve:",obj.object.type);
								}
								type.externTypedef && (state.typedefs[obj.type]=state.typedefs[obj.type].concat(type.externTypedef));
								var symcode = [];
								type.object && type.framework && state.system_frameworks.indexOf(type.object.framework)!==-1 && (symcode.push('@import '+type.object.framework+';'));
								obj.object.framework && state.system_frameworks.indexOf(obj.object.framework)!==-1 && (symcode.push('@import '+obj.object.framework+';'));
								type.object && type.framework && state.system_frameworks.indexOf(type.object.framework)===-1 && (symcode.push('#import <'+type.object.framework+'/'+type.object.framework+'.h>'));
								obj.object.framework && state.system_frameworks.indexOf(obj.object.framework)===-1 && (symcode.push('#import <'+obj.object.framework+'/'+obj.object.framework+'.h>'));
								symcode.push('void HyperloopRegisterSymbol'+obj.mangledName+'(JSContextRef ctx, JSObjectRef object)');
								symcode.push('{');
								symcode.push('\t'+type.type+' result$ = '+obj.name+';');
								symcode.push('\t'+typegenerator.convertToJSValueRef(state, obj, type.mangledName, type, 'result'));
								symcode.push('\tJSStringRef prop = JSStringCreateWithUTF8CString("'+obj.name+'");')
								symcode.push('\tJSObjectSetProperty(ctx,object,prop,result,kJSPropertyAttributeReadOnly|kJSPropertyAttributeDontDelete,0);')
								symcode.push('\tJSStringRelease(prop);');
								symcode.push('}');
								code = code.concat(symcode);
								state.externs[obj.type].length && (externs = externs.concat(state.externs[obj.type]));
								symbols.push(obj.mangledName);
							}
							break;
						}
						default: {
							log.fatal('NOT SUPPORTED',obj);
						}
					}
				}
				catch (E) {
					log.fatal('ERROR',E);
				}
			});

			// now do convertors code
			var fp = path.join(outdir, (genopts.classprefix+CONVERTER_FILENAME).replace('.h','').trim()),
				result = typegenerator.generateInterfaceConverters(state, interfaces, genopts.classprefix+CONVERTER_FILENAME, code, externs);

			fs.writeFileSync(fp+'.m', result.implementation);
			fs.writeFileSync(fp+'.h', result.header);

			sources.push(fp+'.m');

			// add additional pre-written source files to app
			var includedir = path.join(__dirname,'templates','source');
			var files = wrench.readdirSyncRecursive(includedir);
			files.forEach(function(file) {
				var fullpath = path.join(includedir, file);
				if (/\.m$/.test(file) && sources.indexOf(fullpath) === -1) {
					sources.push(fullpath);
				}
			});

			callback(null,sources);

		}
		catch (E) {
			log.fatal(E.stack, E.message);
		}
	});
}

