/**
 * hyperloop compiler module
 */

var path = require('path'),
	fs = require('fs'),
	colors = require('colors'),
	log = require('./log'),
	compiler = require('./compiler'),
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

		try {
			var sourcefile = new SourceFile(relativeFilename,jsfilename),
				ast = compiler.compile(source,filename,sourcefile);

	        asts.push({ast:ast,sourcefile:sourcefile,filename:filename,jsfilename:jsfilename,sourceHash:sourceHash,cachedFile:cachedFile});
	        codegen.addSource(sourcefile);
		}
        catch(E) {
        	log.debug(E.stack);
        	log.error(E.message+" in "+filename+" on "+E.line+":"+E.col);
        	return;
        }
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
            drop_debugger: !!options.debug && !env_prod
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
