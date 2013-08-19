/**
 * iOS specific code generation
 */
var Codegen = require('../codegen').Codegen,
	ejs = require('ejs'),
	fs = require('fs'),
	path = require('path'),
	buildlib = require('./buildlib'),
	clangparser = require('./clangparser'),
	log = require('../log'),
	crypto = require('crypto'),
	zlib = require('zlib'),
	_ = require('underscore'),
	async = require('async'),
	wrench = require('wrench'),
	template,
	jsengine;

function iOSCodegen(options) {	
	Codegen.call(this,options);
};

// extend our base class
iOSCodegen.prototype.__proto__ = Codegen.prototype;

// implement the generate method
iOSCodegen.prototype.generate = function(callback) {

	var generate = [],
		global_packages,
		system_frameworks = [],
		self = this,
		options = this.options,
		srcdir = options.srcdir,
		cflags = [],
		linkflags = [],
		minversion = options['min-version'] || '7.0',
		nativeargs = [],
		includedirs = [],
		jsengineName = (/jsc|jscore/i.test(options.jsengine) || !options.jsengine || options.jsengine===true) ? 'jscore' : options.jsengine,
		jsengineFile = path.join(__dirname,jsengineName,'codegen.js');

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

		try {
			self.sources.forEach(function(source){

				var imports = [],
					includes = [],
					statics = {},
					classes = {},
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
						case 'class': {
							if (!(symbol.value in classes)) {
								classes[symbol.value] = symbol;
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
						case 'static': {
							if (!(symbol.value in statics)) {
								statics[symbol.value] = symbol;
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
								functions[symbol.value] = symbol;
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
					statics: statics,
					classes: classes,
					imports: imports,
					constructors: constructors,
					functions: functions,
					source: source.jsSource,
					includes: includes,
					nativeFilename: source.generateFilename(srcdir),
					cached: source.cached
				}

				generate.push(obj);
			});
		}
		catch (E) {
			log.debug(E.stack)
			return callback(E);
		}

		buildlib.getXcodeSettings(function(err,settings){
			if (err) return callback(err);

			var headerfile = path.join(__dirname,'objc.h');
			var objch = [];
			global_packages.forEach(function(p){
				objch.push('@import '+p+';');
			});

			// always sort our imports/natives so that we can hash. if all the 
			// imports and natives are the same (as evidenced by the same hash), 
			// we can re-use the same module AST that is cached
			var hashkey = objch.sort().join('') + nativeargs.sort().join(''),
				hash = crypto.createHash('md5').update(hashkey).digest('hex'),
				moduleCache = path.join(process.env['TMPDIR'],'HyperLoopModuleCache'),
				cacheFile = path.join(moduleCache, hash+'.json'),
				astFile = path.join(moduleCache, hash+'.ast'),
				allCached = true,
				libfile = path.join(options.dest, options.libname || 'libapp.a');

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

			function executeWithClangAST(ast) {

				if (!ast || !ast.symbols || !ast.classes) {
					log.debug(ast);
					throw new Error('invalid clang AST');
				}

				var srcs = [],
					tasks = [];

				generate.forEach(function(gen){
					
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

					// check and make sure our functions are valid
					Object.keys(gen.functions).forEach(function(name){
						var symbol = gen.functions[name],
							f = ast.symbols[name];
						if (!f) {
							throw new Error("Couldn't locate function "+name.magenta.underline+" in "+symbol.node.start.file+" at "+symbol.node.start.line+":"+symbol.node.start.col);
						}
						if (f.arguments.length!=symbol.args.length) {
							throw new Error("Wrong number of arguments passed to "+name.magenta.underline+" in "+symbol.node.start.file+" at "+symbol.node.start.line+":"+symbol.node.start.col+". Expected: "+f.arguments.length+", received: "+symbol.args.length);
						}
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

						// generate the objective-c source
						tasks.push(function(callback){
							var isEmpty = gen.source.length===0;
							zlib.gzip(gen.source,function(err,buf){
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
			var result = jsengine.toValue(ast,{name:'result$',type:gen.ref.returnType,subtype:gen.ref.returnSubtype});
			body+=indent+indent+gen.ref.returnType+' result$ = '+gen.ref.name+'('+varnames.join(',')+');\n';
			body+=indent+indent+'return '+result+';\n';
			body+=indent+'}';
			return body;
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

function formatSource(code, indent) {
    var toks = code.split('\n'),
        result = [toks[0]];
    toks.slice(1).forEach(function(line){
        result.push(indent+line);
    });
    return result.length > 1 ? (result.join('\n') + '\n' + indent) : result[0] + '\n';
}

ejs.filters.source = function(code, indent) {
	return formatSource(code,'');
}

exports.Codegen = iOSCodegen;

//for unit testing
exports.generateStatic = generateStatic;
exports.getJSBuffer = getJSBuffer;
