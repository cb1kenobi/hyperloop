/**
 * hyperloop compiler module
 */

var path = require('path'),
	fs = require('fs'),
	colors = require('colors'),
	log = require('./log'),
	_ = require('underscore'),
	temp = require('temp'),
	Uglify = require('uglify-js'),
	wrench = require('wrench'),
	crypto = require('crypto'),
	commands = {};

/**
 * get a list of exported commands that hyperloop supports
 */
exports.getCommands = function() {
	var result = [];
	Object.keys(commands).forEach(function(c){
		result.push(commands[c]);
	});
	return result;
}

/**
 * execute a specific command
 */
exports.run = function (command, options, args) {
	var cmd = commands[command];
	if (!cmd) {
		log.error('invalid command: ',command);
	}
	delete options['colors']; // we don't need our color config
	try {
		cmd.execute(options,args);
	}
	catch(E){
		log.debug(E.stack);
		log.error(E.toString());
	}
}

/**
 * base class for commands
 */
function Command(name, desc, func) {
	this.description = desc;
	this.command = func;
	this.name = name;
}

Command.prototype.getName = function() {
	return this.name;
}

Command.prototype.getHelp = function() {
	return this.description;
}

Command.prototype.execute = function(options, args) {
	this.command(options,args);
}

/**
 * check to make sure that the `name` key is present in `options` and if not
 * exit with the error message `help`
 */
function required(options, name, help) {
	if (!options[name]) {
		log.error('Missing required options '+('--'+name).magenta.bold+' which should '+help);
	}
}

/**
 * returns true if file is a directory
 */
function isDirectory(file) {
	return fs.statSync(file).isDirectory();
}

/**
 * recursively get a listing of files for a given directory
 */
function filelisting(dir, filter, files) {
	files = files || [];
	fs.readdirSync(dir).forEach(function(f){
		var f = path.join(path.resolve(dir),f);
		if (isDirectory(f)) {
			filelisting(f, filter, files);
		}
		else {
			filter.test(f) && files.push(f);
		}
	});
	return files;
}

/**
 * turn an AST node array into a JS array
 */
function makeArrayFromArg(arg) {
	var array = [];
	if (arg.elements && arg.elements.length) {
		arg.elements.forEach(function(a){
			array.push(a.value);
		});
	}
	return array;
}

/**
 * turn an AST node value into a JS value
 */
function toValue(value, node) {
	if (!value) return null;

	if (value.elements) {
		value = makeArrayFromArg(value);
	}
	else if (value.properties) {
		value = makeDictionaryFromArg(value,node);
	}
	else if (value.value) {
		value = value.value;
	}
	else if (value.name) {
		// this is a dynamic value - look it up
		var v = value.scope.find_variable(value.name);
		if (!v) {
			// variable was not found
			throw new Error("Couldn't find variable named: "+value.name+" at "+value.start.file+" on "+value.start.line+":"+value.start.col);
		}
		value = toValue(v.init,node);
	}
	else if (value.left && value.right && value.operator) {
		// this is an expression
		value = evalExpression(node,value);
	}
	return value;
}

/**
 * attempt to static evaluate an AST expression into a JS string
 */
function evalExpression(node, arg) {
    var scope = {},
        expr = [],
        vars = node.expression.scope ? node.expression.scope.variables._values : node.expression.expression.scope.variables._values,
        fn;
    //expand our scope into function args that we can invoke to resolve the value
    for (var k in vars) {
        var v = vars[k].init.value;
        scope[k.substring(1)] = v;
        expr.push(v);
    }
    try {
        fn = "(function("+Object.keys(scope).join(",")+"){ return " + arg.left.print_to_string() + arg.operator + arg.right.print_to_string() + "; })";
        var expression = eval(fn);
        return expression.apply(scope,expr);
    }
    catch(E){
        var r = /(\w) is not defined/,
            m = r.exec(E.message);
        if (m) {
            throw new Error("can't seem to determine value of '"+m[1]+"' during import at "+node.start.file+' on line '+node.start.line);
        }
        throw E;
    }
}

/**
 * turn a AST node dictionary into a JS dictionary
 */
function makeDictionaryFromArg(arg, node) {
	var obj = {};
	arg.properties.forEach(function(p){
		obj[p.key] = toValue(p.value,node);
	});
	return obj;
}

const RESERVED_SYMBOLS = /^hyperloop_(native|interface|import)$/;

/**
 * command to handle the compile
 */
commands['compile'] = new Command('compile', 'compile source files', function(options,args) {

	required(options,'src','specify the directory where files should be compiled');
	required(options,'dest','specify the directory where files will be generated');

	var platform = options.platform,
		src = options.src,
		isDir = isDirectory(src),
		codegen = new (require(path.join(__dirname,platform,'codegen.js')).Codegen)(options),
		SourceFile = require(path.join(__dirname,platform,'sourcefile.js')).SourceFile,
		prefix = options.prefix ? options.prefix + '/' : '',
		asts = [];

	var files = isDir ? filelisting(src,/\.js$/) : [src];

	if (files.length===0) {
		log.error('No source files found at',src.magenta);
	}

	if (!fs.existsSync(options.dest)) {
		wrench.mkdirSyncRecursive(options.dest);
	}

	// force an option for the src directory
	options.srcdir = path.join(options.dest, 'src');

	var fileCache = {},
		fileCacheFn = path.join(options.srcdir,'.srccache.json');

	if (fs.existsSync(fileCacheFn)) {
		try {
			fileCache = JSON.parse(fs.readFileSync(fileCacheFn).toString());
		}
		catch(E){
			// if for some reason we can't read it, skip it
			log.debug(E);
		}
	}
	codegen.setFileCache(fileCache);

	//FIXME: right now we have a problem with the node pointer reference on 
	//the cached result, we need to fix this before incremental builds will work again
	//setting this manually to true
	options.force = true;


	files.forEach(function(filename){
		if (!fs.existsSync(filename)) {
			log.error("Couldn't find source file",filename.magenta);
		}

		var relativeFilename = isDir ? filename.replace(path.resolve(src),'') : src,
			relativeFilename = relativeFilename.charAt(0)==='/' ? relativeFilename.substring(1) : relativeFilename,
			relativeFilename = prefix + relativeFilename,
			jsfilename = relativeFilename.replace(/[\s-\/]/g,'_').replace(/\.js$/,''), // replace invalid chars
			source = fs.readFileSync(filename).toString(),
			sourceHash = crypto.createHash('md5').update(source).digest('hex'),
			cachedFile = fileCache[jsfilename];

		if (!options.force && cachedFile && cachedFile.sourceHash===sourceHash) {
			var sf = new SourceFile(relativeFilename,jsfilename).fromJSON(cachedFile.sourcefile);
			if (sf.isCacheable(options.srcdir)) {
				sf.cached = true; // mark as cached
				codegen.addSource(sf);
				log.debug('Found unchanged source file',relativeFilename.yellow);
				return;
			}
		}

		// preprocess source. in the future we'll want to break this out
		// into a real pre-processor class that we can extend for additional
		// functionality like @ifdef, etc.
		['import','native','interface'].forEach(function(sym){
			var re = new RegExp('@'+sym,'g');
			source = source.replace(re,'hyperloop_'+sym);
		});

		var ast,
			ast2,
			sourcefile;

		try {
        	ast = ast2 = Uglify.parse(source,{
            	filename:filename
        	});
        }
        catch(E) {
        	log.debug(E.stack);
        	log.error(E.message+" in "+filename+" on "+E.line+":"+E.col);
        	return;
        }
	    
	    sourcefile = new SourceFile(relativeFilename,jsfilename);

	    ast.figure_out_scope();
	    codegen.addSource(sourcefile);

        var transfomer = new Uglify.TreeTransformer(null, function(node,descend){
            // console.log(node.TYPE, '=>', node.print_to_string());
            if (node instanceof Uglify.AST_SimpleStatement) {
            	// check to see if we're attempting to evaluate one of our reserved symbols
            	if (node.body && node.body.expression && RESERVED_SYMBOLS.test(node.body.expression.name) && node.body.args && node.body.args.length) {
            		var arg = node.body.args[0];
            		switch(node.body.expression.name) {
            			case 'hyperloop_native': {
            				var obj = makeDictionaryFromArg(arg,node.body);
            				sourcefile.processNative(node,obj);
            				return new Uglify.AST_EmptyStatement();
            			}
            			case 'hyperloop_import': {
            				sourcefile.processImport(node,toValue(arg,node));
            				return new Uglify.AST_EmptyStatement();
            			}
            		}
            	}
            }
            else if (node instanceof Uglify.AST_Var) {
            	node.definitions.forEach(function(def){
            		var name = def.name.name,
            			value = def.value;
	            	if (name==='callback') {
	            		if(value.expression && value.expression.name==='hyperloop_interface') {
	            			var callback = toValue(value,node);
	            			if (callback && callback.args && (callback.args.length<1 || callback.args.length>2)) {
	            				throw new Error('expected @interface to only take 1-2 argument(s) and received '+callback.args.length+' in '+node.start.file+' at '+node.start.line+':'+node.start.col);
	            			}
	            			var clsName = callback.args.length===2 ? toValue(callback.args[0],node) : null,
	            				obj = callback.args.length===2 ? callback.args[1] : callback.args[0];

		            		// if this looks like a function, awesome.
	            			if (clsName===null && (!obj.argnames || !obj.body || !obj.variables)) {
	            				throw new Error('expected @interface to take an argument which is a function in '+node.start.file+' at '+node.start.line+':'+node.start.col);
	            			}
	            			else if (clsName && !obj.properties) {
	            				throw new Error('expected @interface to take a second argument which is an object in '+node.start.file+' at '+node.start.line+':'+node.start.col);
	            			}
	            			value.expression.name = sourcefile.processInterface(node,obj,clsName);
	            		}
	            	}
            	});
            }
            else if (node instanceof Uglify.AST_New) {
            	// check to see if we're attempting to instantiate one of our classes
            	if (node.expression && node.expression.name && !node.expression.scope.find_variable(node.expression.name)) {
            		// filter out any built-in classes
            		if (!/(Error)/.test(node.expression.name)) {
	            		var newSymbol = sourcefile.processNewClass(node,node.expression.name);
		                return new Uglify.AST_SymbolConst({name: newSymbol+'()'});
            		}
            	}
            }
            else if (node instanceof Uglify.AST_Call) {
            	// check to see if we're attempting to call one of our static functions
            	if (node.expression && node.expression.name && (!(RESERVED_SYMBOLS.test(node.expression.name))) && !node.expression.scope.find_variable(node.expression.name)) {
                    var args = [];
                    node.args.forEach(function(arg){
                        args.push(arg.print_to_string());
                    });
                    var newSymbol = sourcefile.processFunction(node,node.expression.name,args);
	                return new Uglify.AST_SymbolConst({name: newSymbol+'('+args.join(',')+')'});
	            }
	            else if (node.args && node.expression && node.expression.expression && node.expression.start.type==='name') {
	            	var property = node.expression.start.value,
	            		type = node.expression.start.type,
	            		method = node.expression.property,
                    	args = [];
                    node.args.forEach(function(arg){
                        args.push(arg.print_to_string());
                    });
                    // process it but don't change it
                    sourcefile.processMethod(node,property,method,args);
	            }
            }
        });

        try {
        	ast2 = ast.transform(transfomer);
        }
        catch(E){
        	log.debug(E.stack);
        	log.error(E.toString());
        }

        asts.push({ast:ast2,sourcefile:sourcefile,filename:filename,jsfilename:jsfilename,sourceHash:sourceHash,cachedFile:cachedFile});
	});

	function generateASTs(asts) {
        var env = options.environment,
        	env_dev = /^dev/i.test(env) || !env,
        	env_prod = /^prod/i.test(env),
        	env_test = /^test/i.test(env);
			build_opts = {
	        	"DEBUG": options.debug || false,
	            "TITANIUM_VERSION": "0.0.0",
	            "TITANIUM_BUILD_HASH": "",
	            "TITANIUM_BUILD_DATE": new Date().toString(),
	            "OS_IOS": /(ios|iphone|ipad)/i.test(platform),
	            "OS_IPHONE": /(ios|iphone)/i.test(platform),
	            "OS_IPAD": /(ios|ipad)/i.test(platform),
	            "OS_ANDROID": /(android)/i.test(platform),
	            "OS_BLACKBERRY": /(blackberry)/i.test(platform),
	            "OS_WEB": /(web|html)/i.test(platform),
	            "OS_MOBILEWEB": /(web|html)/i.test(platform),
	            "OS_TIZEN": /(tizen)/i.test(platform),
	            "ENV_DEV": env_dev,           
	            "ENV_DEVELOPMENT": env_dev,
	            "ENV_TEST": env_test,
	            "ENV_PRODUCTION": env_prod
        	},
        	ti_key = /^ti-/i;

        // attempt to pass in any additional keys from command line which will
        // customize our compression
        Object.keys(options).forEach(function(k){
        	var value = options[k];
        	if (ti_key.test(k)) {
        		k = k.replace(ti_key,'TITANIUM_').replace(/-/g,'_').toUpperCase();
        		build_opts[k] = value;
        	}
        	else {
        		build_opts[k.toUpperCase()] = value;
        	}
        });

        log.debug('using JS compress options:',JSON.stringify(build_opts).grey);

        var compressor = Uglify.Compressor({
            global_defs: build_opts,
            warnings: false,
            unused: false,
            dead_code: true,
            join_vars: true,
            properties: true,
            drop_debugger: !!options.debug
        }),
        sourceResults = {};

        asts.forEach(function(entry){
        	var sourcefile = entry.sourcefile,
        		ast = entry.ast,
        		filename = entry.filename,
        		jsfilename = entry.jsfilename,
        		sourceHash = entry.sourceHash,
        		cachedFile = entry.cachedFile,
		    	source_map = Uglify.SourceMap({
		        	file: filename
	    		}),
		        stream = Uglify.OutputStream({
			        source_map: source_map,
			        beautify: options.debug
			    });

	        // compress our source
	        ast.figure_out_scope();
	        ast = ast.transform(compressor);
		    ast.print(stream);

		    var sourcecode = stream.toString();

		    if (options.debug) {
		    	var jssrc = path.join(options.dest,'src',jsfilename+'.js');
		    	wrench.mkdirSyncRecursive(path.dirname(jssrc));
		    	fs.writeFileSync(jssrc, sourcecode);
		    	log.debug('wrote output JS at '+jssrc.yellow);
		    }

		    //TODO: write out source map

		    sourcefile.finish(sourcecode);

		    // map our generate source into our results
		    sourceResults[sourcefile.filename] = sourcecode;

		    // remember cached file info
		    fileCache[jsfilename] = {
		    	sourceHash: sourceHash,
		    	sourcefile: sourcefile
		    };
        });

		return sourceResults;
	}

    codegen.generate(asts,generateASTs,function(err,file){
    	if (err) {
    		log.debug(err.stack);
    		log.error(err.toString());
    	}
	 	if (file) {

	    	// only write out the cached file if we are passed a file, otherwise,
	    	// its unchanged from previous compile
	    	fs.writeFileSync(fileCacheFn,JSON.stringify(fileCache,null,'\t'));
    	}
    	!options.dontExit && process.exit(0);
    	options.callback && options.callback();
    });

});

/**
 * command to handle the package
 */
commands['package'] = new Command('package', 'package source files', function(options,args) {

	required(options,'platform','specify the platform for packaging');

	var fn = commands['compile'],
		platform = options.platform,
		Packager = require(path.join(__dirname,platform,'packager.js')).Packager;
		packager = new Packager(options);

	// tell the compiler not to automatically exit on completion
	options.dontExit = true;

	// called after the compiler
	options.callback = function() {
		delete options.callback;
		packager.package(options,args,function(err){
			err && log.error(err.message);
		});
	};

	fn.command(options,args);
});
