/**
 * iOS specific code generation
 */
var Codegen = require('../codegen').Codegen,
	ejs = require('ejs'),
	fs = require('fs'),
	path = require('path'),
	buildlib = require('./buildlib'),
	clangparser = require('./clangparser'),
	Uglify = require('uglify-js'),
	log = require('../log'),
	crypto = require('crypto'),
	zlib = require('zlib'),
	_ = require('underscore'),
	async = require('async'),
	wrench = require('wrench'),
	semver = require('semver'),
	template,
	jsengine;

function iOSCodegen(options) {	
	Codegen.call(this,options);
};

// extend our base class
iOSCodegen.prototype.__proto__ = Codegen.prototype;

function toResultClassType(resultType) {
	return resultType.replace('*','').trim();
}

function findResultTypeFromExpression(ast, node, code) {
	var tok = code.split("."),
		c = 0,
		i,
		p = tok[++c],
		lp = tok[0], 
		intf = ast.classes[lp];

	if (!intf) {
		throw new Error("couldn't find interface "+tok[0].red+" in "+node.start.file+" on "+node.start.line+":"+node.start.col);
	}

	while(p) {
		if ((i=p.indexOf('('))>0) {
			// method invocation
			var methodName = p.substring(0,i),
				methodObj = intf.methods[methodName];
			if (!methodObj) {
				throw new Error("couldn't find method "+methodName.red+" on interface "+lp.red+" in "+node.start.file+" on "+node.start.line+":"+node.start.col);
			}
			lp = toResultClassType(methodObj.returnType);
			intf = ast.classes[lp];
		}
		else {
			// property accessor
			var prop = intf.properties[p];
			if (!prop) {
				throw new Error("couldn't find method "+p.red+" on interface "+lp.red+" in "+node.start.file+" on "+node.start.line+":"+node.start.col);
			}
			lp = toResultClassType(prop.type);
			intf = ast.classes[lp];
		}
		p = tok[++c];
	}

	return {name:lp,interface:intf};
}

function findClass(ast, node, property, value) {
	if (!value) {
		// if not defined in our source, it's probably a method, check to see
		value = ast.classes[property];
		if (!value) {
			throw new Error("trying to resolve variable "+property.red+" and can't determine its original definition in "+node.start.file+" on "+node.start.line+":"+node.start.col);
		}
		return { interface: value, name: property };
	}
	if (value.init && value.init) {
		var expr = value.init,
			code = expr.print_to_string(),
			result = findResultTypeFromExpression(ast, node, code);
		if (result.name==='id') {
			//UIButton.buttonWithType returns an id instead of a UIButton.  doh!
			var tok = code.split('.')[0];
			result.staticCls = ast.classes[tok];
			result.staticClsName = tok;
		}
		return result;
	}
	throw new Error("having a hard time resolving class for code: "+node.print_to_string()+" in "+node.start.file+" on "+node.start.line+":"+node.start.col);
}

function findMethod(ast, node, classname, intf, name) {
	var p = intf;
	while(p) {
		if (name in p.methods) {
			return p.methods[name];
		}
		p = ast.classes[p.superClass];
	}
}

function jstypeSupportsNativeType(jsvalue, type) {
	var jstype = typeof(jsvalue);
	switch(jstype) {
		case 'number': {
			return /(NSInteger|NSUInteger|NSNumber|int|float|double|long|short|char)/.test(type);
		}
		case 'function': {
			break;
		}
		case 'object': {
			break;
		}
		case 'string': {
			return /(NSString|NSMutableString|CFString)/.test(type);
		}
		case 'boolean': {
			return /(NSBoolean|bool|Boolean)/.test(type);
		}
		case 'null':
		case 'undefined': {
			break;
		}
	}
	// assume if it falls through, it's OK
	return true;
}

function findAST(asts, source) {
	for (var c=0;c<asts.length;c++) {
		if (asts[c].sourcefile===source) {
			return asts[c].ast;
		}
	}
	return null;
}

function replaceAST(asts, source, newast) {
	for (var c=0;c<asts.length;c++) {
		if (asts[c].sourcefile===source) {
			asts[c].ast = newast;
		}
	}
	return null;
}

function replaceASTNode(ast, target, newnode) {
	var walker = new Uglify.TreeTransformer(function(node,descend){
			if (node === target) {
				return newnode;
			}
	});
	return ast.transform(walker);
}

function validateSourceAgainstAST(ast, sources, asts, used_classes) {
	sources.forEach(function(source){

		var sourceAST = findAST(asts,source);
		// console.log(sourceAST.print_to_string())

		source.symbols.forEach(function(symbol){
			switch(symbol.type) {
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
						throw new Error("Can't find symbol "+symbol.value.red+" in "+symbol.framework.red+" in "+node.start.file+" on "+node.start.line+":"+node.start.col);
					}
					break;
				}
				case 'interface': {
					break;
				}
				case 'method': {
					var method = symbol.method,
						node = symbol.node,
						symbolRef = node.expression.expression.scope.find_variable(symbol.property),
						obj, objname, staticCls, staticClsName;

					if (!symbolRef) {
						// this means that we can't find the variable in JS so it's probably 
						// an imported class - let's look it up
						obj = ast.classes[symbol.property] || ast.symbols[symbol.property];
						objname = symbol.property;
					}
					else {
						// ignore these since they don't point to expressions so we don't care
						if (symbolRef.init && symbolRef.init.start && symbolRef.init.start.value==='interface') {
							return;
						}

						var classPointer = findClass(ast,node,symbol.property,symbolRef);
						obj = classPointer.interface;
						objname = classPointer.name;
						staticCls = classPointer.staticCls;
						staticClsName = classPointer.staticClsName;
					}
					// obj now points to the original interface for this property

					// console.log('objname=',objname);
					// console.log('staticCls=',staticCls);

					// find our method object
					var m = findMethod(ast, node, objname, obj, method);
					if (!m) {

						// sometimes things like UIButton.buttonWithType return an id (in AST)
						// instead of the UIButton. the static class will point to UIButton 
						// and we can check that class if we can find it
						if (staticCls && staticCls.methods) {
							m = findMethod(ast, node, objname, staticCls, method);
							objname = staticClsName;
						}

						if (!m) {
							throw new Error("Can't find method "+method.red+" in interface "+objname.red+" in "+node.start.file+" on "+node.start.line+":"+node.start.col);
						}
					}

					// check to make sure that the number of arguments passed are correct
					if (m.args.length!=symbol.args.length) {
						throw new Error("Wrong number of arguments passed to method "+method.red+" in interface "+objname.red+" in "+node.start.file+" on "+node.start.line+":"+node.start.col+". Expected: "+m.args.length+", received: "+symbol.args.length);
					}

					// check to see if any of the methods requires a wrap
					if (m.args.length) {
						for (var c=0;c<m.args.length;c++) {
							var arg = m.args[c],
								type = toResultClassType(arg.type);
							if (type==='SEL') {
								var instance = node.start.value,
									method = node.expression.property;

								log.debug('we need to wrap because of type:',type);
								log.debug('instance=',instance,'method=',method);
								log.debug('selector=',m.selector);

								var newbody = 'invoke$$('+instance+',"'+m.selector+'",'+symbol.args.join(',')+')';
								log.debug(newbody);

	                		 	var tn = new Uglify.AST_SymbolConst({name: newbody});
								var newast = replaceASTNode(sourceAST,node,tn);
								replaceAST(asts, sourceAST, newast);
								sourceAST = newast;
								break;
							}
							else {
								var argValue = symbol.node.expression.expression.scope.find_variable(symbol.args[c]);
								if (argValue) {
									//var i = findClass(ast,node,symbol.property,argValue);
									// console.log(argValue.init.print_to_string())
								}
//								console.log('arg=',symbol.node.expression.expression.scope.find_variable(symbol.args[c]));
								// if (!jstypeSupportsNativeType(symbol.args[c],arg.type)) {
								// 	log.warn('argument '+(c+1)+' looks to be a different type than expected. expected '+arg.type+', received '+typeof(symbol.args[c]).red+' ('+symbol.args[c]+') in '+node.start.file+' on '+node.start.line+':'+node.start.col);
								// }
							}
						}
					}

					break;
				}
			}
		});
	});
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
		minversion = options['min-version'] || '7.0',
		nativeargs = [],
		includedirs = [],
		jsengineName = (/jsc|jscore/i.test(options.jsengine) || !options.jsengine || options.jsengine===true) ? 'jscore' : options.jsengine,
		jsengineFile = path.join(__dirname,jsengineName,'codegen.js'),
		fileCache = this.fileCache,
		prefix = this.options.classprefix || '',
		sourcefiles = [];


	// make sure it's a valid JS engine
	if (!fs.existsSync(jsengineFile)) {
		return callback(new Error("Invalid option specified for --jsengine. Couldn't find engine named: "+jsengineName.red));
	}

	// load the jsengine codegen file dynamically
	jsengine = require(jsengineFile);

	// load the jsengine template file dynamically
	template = fs.readFileSync(path.join(__dirname,jsengineName,'templates','template.ejs')).toString();

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

		// figure out all the system frameworks
		frameworks.forEach(function(f){
			var name = f.replace('.framework','');
			if (system_frameworks.indexOf(name)===-1) {
				system_frameworks.push(name);
			}
		});

		global_packages = system_frameworks;
		
		var used_classes = [];

		try {
			self.sources.forEach(function(source){

				var imports = [],
					includes = [],
					constructors = {},
					functions = {};

				source.symbols.forEach(function(symbol){
					switch(symbol.type) {
						case 'package': {

							if (global_packages.indexOf(symbol.value)===-1) {
								global_packages.push(symbol.value);
							}
							if (global_packages.indexOf(symbol.value)!==-1 && imports.indexOf(symbol.value)===-1) {
								imports.push(symbol.value);
							}
							break;
						}
						case 'native': {
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
					imports: imports,
					constructors: constructors,
					functions: functions,
					includes: includes,
					nativeFilename: source.generateFilename(srcdir),
					cached: source.cached,
					dirname: source.dirname
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

			var tmpdir = process.env['TMPDIR'];

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

			// always sort our imports/natives so that we can hash. if all the 
			// imports and natives are the same (as evidenced by the same hash), 
			// we can re-use the same module AST that is cached
			var hashkey = objch.sort().join('') + nativeargs.sort().join(''),
				hash = crypto.createHash('md5').update(hashkey).digest('hex'),
				cacheFile = path.join(moduleCache, hash+'.json'),
				astFile = path.join(moduleCache, hash+'.ast'),
				allCached = true,
				libfile = path.join(options.dest, options.libname || 'libapp.a'),
				cachedFileHash = fileCache && fileCache.hashkey,
				srckey = sourcefiles.sort().join(''),
				// create a consistent hash we can use for the register classes function
				// name which is simply a hash of all the names of the source files. as long
				srchash = crypto.createHash('md5').update(srckey).digest('hex'),
				cachedSrcHash = fileCache && fileCache.srchashkey;

			if (cachedFileHash===hash && cachedSrcHash===srchash)
			{
				// quick scan to see if we're all cached
				generate.forEach(function(gen){
					allCached = allCached && gen.cached;
				});

				// if all files are unchanged, just go ahead and skip the ast parse
				if (allCached) {
					if (fs.existsSync(libfile)) {
						log.info('Found unchanged universal library file at '+libfile.yellow);
					}
					return callback();
				}
			}

			fileCache.hashkey = hash;
			fileCache.srchashkey = srchash;
			// for debugging assistance only
			fileCache.imports=  objch.sort();
			fileCache.nativeargs = nativeargs.sort();
			fileCache.astFile = cacheFile;

			function executeWithClangAST(ast) {

				if (!ast || !ast.symbols || !ast.classes) {
					log.debug(ast);
					throw new Error('invalid clang AST');
				}

				// valid our source code before we generate against the ast
				validateSourceAgainstAST(ast, self.sources, asts, used_classes);

			    // now generate the asts
			    var sourceResults = generateASTCallback(asts);

				var srcs = [],
					tasks = [],
					result,
			    	codegenerate = {},
			    	generated = [],
			    	includes = ['#import <objc/runtime.h>','@import JavaScriptCore;'],
			    	depends = used_classes;


			   	try {

			   		result = jsengine.generate(ast, codegenerate, depends[0]||'UIApplication', depends, generated, includes, prefix, srchash);

					var types = path.join(options.srcdir,'types.m');
					fs.writeFileSync(types,result.impl);
					// make sure we compile it
					srcs.push(types);

					types = path.join(options.srcdir,'types.h');
					fs.writeFileSync(types,result.header);

			   	}
			   	catch(E) {
			   		log.debug(E.stack)
			   		log.error(E);
			   	}

				generate.forEach(function(gen){

					// get our generated JS source code
					var sourcecode = sourceResults[gen.filename];
					
					// check the classes and make sure they are valid
					Object.keys(gen.classes).forEach(function(name){
						var symbol = gen.classes[name],
							global = ast.classes[name];
						if (!global) {
							throw new Error("Couldn't locate class "+name.magenta.underline+" in "+symbol.node.start.file+" at "+symbol.node.start.line+":"+symbol.node.start.col);
						}
						if (global.framework && gen.imports.indexOf(global.framework)===-1) {
							throw new Error("Couldn't locate package for "+name.magenta.underline+" in "+symbol.node.start.file+" at "+symbol.node.start.line+":"+symbol.node.start.col+". Add "+("package('"+global.framework+"');").magenta.underline);
						}
						if (global.import && gen.includes.indexOf(global.import)===-1) {
							gen.includes.push(global.import);
						}
						symbol.ref = global;
					});

					// check the statics and make sure they are valid
					Object.keys(gen.statics).forEach(function(name){
						var symbol = gen.statics[name],
							global = ast.symbols[name];
						if (!global) {
							throw new Error("Couldn't locate static symbol "+name.magenta.underline+" in "+symbol.node.start.file+" at "+symbol.node.start.line+":"+symbol.node.start.col);
						}
						if (global.framework && gen.imports.indexOf(global.framework)===-1) {
							throw new Error("Couldn't locate package for "+name.magenta.underline+" in "+symbol.node.start.file+" at "+symbol.node.start.line+":"+symbol.node.start.col+". Add "+("package('"+global.framework+"');").magenta.underline);
						}
						if (global.import && gen.includes.indexOf(global.import)===-1) {
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

						// map helper functions
						gen.ast = ast;
						gen.generateStatic = generateStatic; 
						gen.currentArgument = currentArgument;
						gen.prefix = prefix;
						gen.registerFunctionName = generated.registerName;

						// generate the objective-c source
						tasks.push(function(callback){
							var isEmpty = sourcecode.length===0;
							zlib.gzip(sourcecode,function(err,buf){
								if (err) return callback(err);
								gen.jsBuffer = isEmpty ? '0' : getJSBuffer(buf,'		',0,30);
								var source = ejs.render(template, {
									gen:gen
								});
								// write out the source file
								var fn = gen.nativeFilename;
								srcs.push(fn);
								log.debug('wrote objective-c source for '+gen.name.yellow+' to '+fn.yellow);
								fs.writeFile(fn, source, callback);
							});
						});
					}
				});

				// write all the files and then we will compile and link
				async.parallel(tasks,function(err){
					if (err) return callback(err);

					var config = {
						minVersion: minversion,
						libname: options.libname || 'libapp.a', 
						srcfiles: srcs, 
						outdir: options.dest, 
						cflags: cflags, 
						linkflags: linkflags
					};

					log.debug('using compiler/linker config:',JSON.stringify(config).grey);

					buildlib.compileAndMakeStaticLib(config, function(err,results){
						if (err) return callback(err);
						log.info('Generated universal library file at '+results.libfile.yellow);
						return callback(null,results.libfile);
					});

				});
			}

			if (fs.existsSync(cacheFile)) {
				log.debug('Using AST cache file at',cacheFile.yellow);
				try { 
					executeWithClangAST(JSON.parse(fs.readFileSync(cacheFile).toString()));
				}
				catch(E) {
					return callback(E);
				}
			}
			else {
				if (!fs.existsSync(moduleCache)) {
					fs.mkdir(moduleCache);
				}
				fs.writeFileSync(headerfile,objch.join('\n'));
				log.info('Generating AST. This may take a minute or so...');
				buildlib.clang(headerfile,minversion,nativeargs,function(err,result){
					if (err) return callback(err);
					fs.writeFileSync(astFile,result);
					log.debug('Generated AST result file at',astFile);
					clangparser.parseBuffer(result,function(err,ast){
						if (err) return callback(err);
						log.debug('Generating AST cache file at',cacheFile);
						fs.writeFileSync(cacheFile,JSON.stringify(ast,null,'\t'));
						try {
							executeWithClangAST(ast.toJSON());
						}
						catch(E) {
							log.debug(E.stack)
							callback(E);
						}
					});
				});
			}

		});

	});

}

function generateStatic(ast,gen,indent) {
	switch(gen.ref.metatype) {
		case 'function': {
			var result = jsengine.toValue(ast,{name:'result$',type:gen.ref.returnType,subtype:gen.ref.returnSubtype});
			if (/\.\.\.\)$/.test(gen.ref.signature)) {
				// this is a vararg, we need to build the signature differently - skip it
				break;
			}
			else {
				var args = gen.ref.arguments;
				var argbody = [],
					varnames = [],
					count = 0;
				args.forEach(function(a){
					if (!a.type && !a.subtype) {
						varnames.push('arg'+count);
						argbody.push(a.name+' arg'+count);
					}	
					else {
						varnames.push(a.name);
						argbody.push(a.type+' '+a.name);
					}
					count++;
				});
				var argsig = '('+argbody.join(', ')+')';
				var body = '^' + argsig + ' {\n';
				body+=indent+indent+gen.ref.returnType+' result$ = '+gen.ref.name+'('+varnames.join(',')+');\n';
				body+=indent+indent+'return '+result+';\n';
				body+=indent+'}';
				return body;
			}
		}
		case 'constant': {
			return jsengine.toValue(ast,gen.ref);
		}
	}
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

function currentArgument(times, name) {
	var result = [];
	for (var c=0;c<times;c++) {
		result.push('[(JSValue*)['+name+' objectAtIndex:'+c+'] toObject]');
	}
	return result.join(',');
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

//for unit testing
exports.generateStatic = generateStatic;
exports.getJSBuffer = getJSBuffer;
