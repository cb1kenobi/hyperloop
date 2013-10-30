/**
 * common utilities
 */
var fs = require('fs'),
	path = require('path'),
	ejs = require('ejs'),
	appc = require('node-appc'),
	uuid = require('node-uuid'),
	wrench = require('wrench'),
	log = require('./log'),
	crypto = require('crypto');

// NOTE: Please expose new methods in the "mixin" method below. Thank you! -Dawson
mixin(exports);

/**
 * Mixes in util's methods in to the specified object (such as a module's exports), allowing for an easy exposure of
 * these methods elsewhere.
 */
function mixin(obj) {
	!obj.mixin && (obj.mixin = mixin);
	!obj.copySync && (obj.copySync = copySync);
	!obj.copyAndFilterEJS && (obj.copyAndFilterEJS = copyAndFilterEJS);
	!obj.copyAndFilterString && (obj.copyAndFilterString = copyAndFilterString);
	!obj.copyFile && (obj.copyFile = copyFile);
	!obj.isDirectory && (obj.isDirectory = isDirectory);
	!obj.downloadResourceIfNecessary && (obj.downloadResourceIfNecessary = downloadResourceIfNecessary);
	!obj.writableHomeDirectory && (obj.writableHomeDirectory = writableHomeDirectory);
	!obj.sha1 && (obj.sha1 = sha1);
	!obj.guid && (obj.guid = guid);
	!obj.escapePaths && (obj.escapePaths = escapePaths);
	!obj.indentify && (obj.indentify = indentify);
	!obj.isDefined && (obj.isDefined = isDefined);
	!obj.makeArrayFromArg && (obj.makeArrayFromArg = makeArrayFromArg);
	!obj.toValue && (obj.toValue = toValue);
	!obj.evalExpression && (obj.evalExpression = evalExpression);
	!obj.makeDictionaryFromArg && (obj.makeDictionaryFromArg = makeDictionaryFromArg);
	!obj.nodeIsArray && (obj.nodeIsArray = nodeIsArray);
	!obj.nodeIsObjectLiteral && (obj.nodeIsObjectLiteral = nodeIsObjectLiteral);
	!obj.nodeInfo && (obj.nodeInfo = nodeInfo);
	return obj;
}

function guid() {
	return uuid.v4().toUpperCase();
}

function escapePaths(cmd) {
	return cmd.replace(/(["\s'$`\\])/g,'\\$1');
}

function copySync(from, to) {
	var contents = fs.readFileSync(from);
  fs.writeFileSync(to, contents);
  var stat = fs.lstatSync(from);
  fs.chmodSync(to, stat.mode);
}

function copyAndFilterEJS(from, to, obj) {
	var f = fs.readFileSync(from).toString(),
		o = ejs.render(f,obj);
	fs.writeFileSync(to, o);
}

function copyAndFilterString(from, to, obj) {
	var f = fs.readFileSync(from).toString();
	Object.keys(obj).forEach(function(key){
		var value = obj[key];
		f = f.replace(new RegExp(key,'g'),value);
	});
	fs.writeFileSync(to, f);
}

const ignoreList = /\.(CVS|svn|git|DS_Store)$/;

/**
 * copy srcFile to destFile and optionally, filter based on function
 */
function copyFile(srcFile, destFile, filter) {
	if (!ignoreList.test(srcFile)) {
		// if we have a filter and it passed or if we don't have one at all
		if (!filter || (typeof(filter)==='function' && filter(srcFile,destFile))) {
		    var contents = fs.readFileSync(srcFile);
		    fs.writeFileSync(destFile, contents);
		    log.debug('copying',srcFile.cyan,'to',destFile.cyan);
		}
	}
}

/**
 * returns true if file path is a directory
 */
function isDirectory(file) {
	return fs.statSync(file).isDirectory();
}

/**
 * return the sha1 of the contents string
 */
function sha1(contents) {
	return crypto.createHash('sha1').update(contents).digest('hex');
}

/**
 * return a writeable home directory for hyperloop
 */
function writableHomeDirectory() {
	var dir;

	if (process.platform==='darwin') {
		dir = path.join(process.env['HOME'],'Library','Application Support','org.appcelerator.hyperloop');
	}
	else {
		dir = path.join(appc.fs.home(),'hyperloop');
	}
	if (!fs.exists(dir)) {
		wrench.mkdirSyncRecursive(dir);
	}
	return dir;
}

/**
 * download a pre-build third-party tool / library
 */
function downloadResourceIfNecessary(name, version, url, checksum, dir, callback) {

	var verFn = path.join(dir,name+'-version.txt'),
		zf = path.join(dir,name+'.zip'),
		zipdir = path.join(dir,name),
		localVersion = fs.existsSync(verFn) ? fs.readFileSync(verFn).toString() : null;

	if (version!==localVersion || !fs.existsSync(zipdir)) {
		var http = require('http'),
			urllib = require('url'),
			req = http.request(urllib.parse(url)),
			hash = crypto.createHash('sha1');

		if (!fs.existsSync(zipdir)) {
			wrench.mkdirSyncRecursive(zipdir);
		}

		req.on('response', function(res) {
			if (res.statusCode!=200) {
				return callback(new Error("error loading url: "+url+", status: "+res.statusCode));
			}
			var len = parseInt(res.headers['content-length'], 10),
				bar = new appc.progress('  Downloading '+name+' library'.magenta+' [:bar]'+' :percent :etas'.cyan, {
				complete: '=',
				incomplete: ' ',
				width: 50,
				total: len
			}),
			stream = fs.createWriteStream(zf);

			bar.tick(0);

			res.on('data', function(chunk) {
				bar.tick(chunk.length);
				hash.update(chunk);
				stream.write(chunk, encoding='binary');
			});

			res.on('end', function() {
				fs.writeFileSync(verFn,version);
				stream.close();
				process.stdout.clearLine && process.stdout.clearLine();  // clear current text
  				process.stdout.cursorTo && process.stdout.cursorTo(0);  // move cursor to beginning of line
  				process.stdout.write('\n');
				var checkChecksum = hash.digest('hex');
				if (checkChecksum!==checksum) {
					return callback(new Error("Invalid checksum ("+checkChecksum+") received, expected ("+checksum+") for "+url));
				}
				log.info('extracting zip contents');
				appc.zip.unzip(zf,zipdir,function(err){
					log.debug('unzip completed, contents should be in',zipdir);
					fs.unlink(zf,callback);
				});
			});
		});

		req.end();

	}
	else {
		callback();
	}
}

/**
 * turn a string of content into a string with each line with an indent
 */
function indentify(string, indent) {
	indent = typeof(indent) === 'undefined' ? '    ' : indent;
	return string.split('\n').join('\n' + indent);
}

/**
 * check have to make sure to 0 (number) isn't intepreted as false -
 * so we must make sure a check for not specifically undefined or null
 */
function isDefined(value) {
	return !!(value!==null && value!==undefined);
}


/**
 * turn an AST node array into a JS array
 */
function makeArrayFromArg(arg, node, globals) {
	var array = [];
	if (arg.elements && arg.elements.length) {
		arg.elements.forEach(function(a){
			if (isDefined(a.value)) {
				array.push(a.value);
			}
			else if (a.name) {
				var value = (node && node.scope || node.expression && node.expression.scope) ? (node.scope ? (node.scope) : (node.expression.scope)).find_variable(a.name) : null;
				array.push(isDefined(value) && v || a.name);
			}
			else {
				var v = toValue(a,node,globals);
				isDefined(v) && array.push(v);
			}
		});
	}
	return array;
}

/**
 * turn an AST node value into a JS value
 */
function toValue(value, node, globals) {
	if (!isDefined(value)) return null;

	if (value.elements) {
		value = makeArrayFromArg(value,node,globals);
	}
	else if (value.properties) {
		value = makeDictionaryFromArg(value,node,globals);
	}
	else if (isDefined(value.value)) {
		value = value.value;
	}
	else if (value.name) {
		// this is a dynamic value look it up
		var v = value.scope.find_variable(value.name);
		if (!v) {
			if (value.name in globals) {
				return globals[value.name];
			}
			// variable was not found
			throw new Error("Couldn't find variable named: "+value.name+" at "+value.start.file+" on "+value.start.line+":"+value.start.col);
		}
		value = toValue(v.init,node);
	}
	else if (value.left && value.right && value.operator) {
		// this is an expression
		value = evalExpression(node,value,globals);
	}
	else if (value.expression && value.expression.value && value.operator) {
		// this is something like -1.0
		return eval(value.operator+value.expression.value);
	}
	return value;
}

/**
 * attempt to static evaluate an AST expression into a JS string
 */
function evalExpression(node, arg, globals) {
	var scope = {},
		expr = [],
		vars = node.expression.scope ? node.expression.scope.variables._values : node.expression.expression.scope.variables._values,
		fn;
	//expand our scope into function args that we can invoke to resolve the value
	for (var k in vars) {
		var v = vars[k].init && vars[k].init.value;
		scope[k.substring(1)] = v;
		expr.push(v);
	}
	try {
		var prepend = '';
		// put globals inside the function scope so that you can use them as global variables
		globals && Object.keys(globals).forEach(function(k){
			var o = globals[k];
			if (typeof(o)==='function' || typeof(o)==='object') return;
			prepend+='const '+k+' = \"'+o+'\"; ';
		});
		fn = "(function("+Object.keys(scope).join(",")+"){ "+prepend+" return " + arg.left.print_to_string() + arg.operator + arg.right.print_to_string() + "; })";
		var expression = eval(fn);
		return expression.apply(scope,expr);
	}
	catch(E){
		var r = /(\w+) is not defined/,
			m = r.exec(E.message);
		if (m) {
			throw new Error("can't seem to determine value of "+m[1].red+" during import at "+node.start.file+' on line '+node.start.line);
		}
		throw E;
	}
}

/**
 * turn a AST node dictionary into a JS dictionary
 */
function makeDictionaryFromArg(arg, node, globals) {
	var obj = {};
	arg.properties.forEach(function(p) {
		obj[p.key] = toValue(p.value, node, globals);
	});
	return obj;
}

function nodeIsArray(node) {
	return node.elements && typeof(node.elements)==='object';
}

function nodeIsObjectLiteral(node) {
	return node.properties && typeof(node.properties)==='object';
}

function nodeInfo(node) {
	if (!node || !node.start) { return '()'; }
	return '(' + node.start.file + ':' + node.start.line + ':' + node.start.col + ')';
}